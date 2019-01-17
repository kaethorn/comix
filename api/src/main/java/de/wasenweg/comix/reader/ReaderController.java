package de.wasenweg.comix.reader;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import de.wasenweg.comix.Comic;
import de.wasenweg.comix.ComicRepository;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;
import java.util.Enumeration;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@RequestMapping("${spring.data.rest.base-path}")
@RestController
public class ReaderController {

	@Autowired
	private ComicRepository comicRepository;
	
	// TODO figure out a caching strategy:
	/// * in memory, self handled and capped
	//  * file based, self handled and capped
	//  * hybrid
	//  * Spring @Cacheable
	//  * 3rd party library
	// Caching is highly educated because once a comic is open at a 
	// specific page, access is linear from that point as either the
	// previous or next page is opened. Random access is seldom and
	// can be slow.
	// 
	// So a strategy would look like this:
	//  1. Once a page is openend, cache the next page immediately.
	//  2. Evict pages that are behind more than one position.
	// This would mean that once at each turn of a page, the zip
	// would have to be opened and an image extracted. This might
	// cause I/O overhead.
	// Alternatively, a comic could be extracted to the file
	// system entirely at first access and kept there until a
	// predefined timeout (30m). This would probably require a
	// scheduled clean up task.
	
	private final Pattern pageNumberPattern = Pattern.compile("(\\d+)\\.\\w+$");
	
	private ComicPage extractPage(Comic comic, Short page) {
		ComicPage result = new ComicPage();
		ZipFile file = null;
		try {
			file = new ZipFile(comic.getPath());
		} catch (IOException e) {
			e.printStackTrace();
		}
		try {
			final Enumeration<? extends ZipEntry> entries = file.entries();
			while (entries.hasMoreElements()) {
				final ZipEntry entry = entries.nextElement();
				String fileName = entry.getName();
				Matcher m = pageNumberPattern.matcher(fileName);
				if (m.find()) {
					String pageNumber = m.group(1);
					if (Short.valueOf(pageNumber) == page) {
						result.stream = file.getInputStream(entry);
						result.size = entry.getSize();
						result.type = URLConnection.guessContentTypeFromName(fileName);
						result.name = fileName;
					}
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return result;
	}

    @RequestMapping("/read/{id}")
    @ResponseBody
    public ResponseEntity<StreamingResponseBody> readFromBeginning(@PathVariable("id") Long id) {
    	return read(id, (short) 0);
    }

	/**
	 * Returns the page of the given comic.
	 * 
	 * @param id The ID of the comic to open.
	 * @param page The page number from which to start.
	 * @return The extracted page.
	 */
    @RequestMapping("/read/{id}/{page}")
    @ResponseBody
    public ResponseEntity<StreamingResponseBody> read(@PathVariable("id") Long id, @PathVariable("page") Short page) {
		Optional<Comic> comicQuery = comicRepository.findById(id);
		
		if (!comicQuery.isPresent() || id == null || page == null) {
			return null;
		}

		final Comic comic = comicQuery.get();
		ComicPage comicPage = extractPage(comic, page);

		StreamingResponseBody responseBody = outputStream -> {
	        int numberOfBytesToWrite;
	        byte[] data = new byte[1024];
	        while ((numberOfBytesToWrite = comicPage.stream.read(data, 0, data.length)) != -1) {
	            outputStream.write(data, 0, numberOfBytesToWrite);
	        }
	        comicPage.stream.close();
	    };
		
		return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + comicPage.name)
                .contentLength(comicPage.size)
                .contentType(MediaType.parseMediaType(comicPage.type))
                .body(responseBody);
    }
}