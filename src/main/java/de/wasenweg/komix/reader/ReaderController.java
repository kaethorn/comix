package de.wasenweg.komix.reader;

import de.wasenweg.komix.comics.Comic;
import de.wasenweg.komix.comics.ComicRepository;
import de.wasenweg.komix.util.ZipReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.net.URLConnection;
import java.util.List;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

@RequestMapping("/api")
@RestController
public class ReaderController {

    @Autowired
    private ComicRepository comicRepository;

    private ComicPage extractPage(final Comic comic, final Short page) {
        final ComicPage result = new ComicPage();
        ZipFile file = null;
        try {
            file = new ZipFile(comic.getPath());
            final List<ZipEntry> sortedEntries = ZipReader.getImages(file);
            final ZipEntry entry = sortedEntries.get(page);
            final String fileName = entry.getName();
            result.stream = file.getInputStream(entry);
            result.size = entry.getSize();
            result.type = URLConnection.guessContentTypeFromName(fileName);
            result.name = fileName;
        } catch (final IOException e) {
            e.printStackTrace();
        }

        return result;
    }

    @RequestMapping("/read/{id}")
    @ResponseBody
    public ResponseEntity<StreamingResponseBody> readFromBeginning(@PathVariable("id") final String id) {
        return read(id, (short) 0);
    }

    /**
     * Returns the page of the given comic.
     *
     * @param id   The ID of the comic to open.
     * @param page The page number from which to start.
     * @return The extracted page.
     */
    @RequestMapping("/read/{id}/{page}")
    @ResponseBody
    public ResponseEntity<StreamingResponseBody> read(
            @PathVariable("id") final String id,
            @PathVariable("page") final Short page) {
        final Optional<Comic> comicQuery = comicRepository.findById(id);

        if (!comicQuery.isPresent() || id == null || page == null) {
            return null;
        }

        final Comic comic = comicQuery.get();
        final ComicPage comicPage = extractPage(comic, page);

        final StreamingResponseBody responseBody = outputStream -> {
            int numberOfBytesToWrite;
            final byte[] data = new byte[1024];
            while ((numberOfBytesToWrite = comicPage.stream.read(data, 0, data.length)) != -1) {
                outputStream.write(data, 0, numberOfBytesToWrite);
            }
            comicPage.stream.close();
        };

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + comicPage.name)
                .contentLength(comicPage.size).contentType(MediaType.parseMediaType(comicPage.type)).body(responseBody);
    }
}
