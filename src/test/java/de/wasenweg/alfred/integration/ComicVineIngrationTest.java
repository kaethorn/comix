package de.wasenweg.alfred.integration;

import de.wasenweg.alfred.AlfredApplication;
import de.wasenweg.alfred.comics.Comic;
import de.wasenweg.alfred.comics.ComicRepository;
import de.wasenweg.alfred.mockserver.MockServer;
import de.wasenweg.alfred.progress.ProgressRepository;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import reactor.test.StepVerifier;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = { AlfredApplication.class }, webEnvironment = WebEnvironment.RANDOM_PORT)
@EnableAutoConfiguration
@ActiveProfiles(profiles = "test")
public class ComicVineIngrationTest {

  @LocalServerPort
  private int port;

  @Autowired
  private ComicRepository comicRepository;

  @Autowired
  private ProgressRepository progressRepository;

  @Autowired
  private IntegrationTestHelper integrationTestHelper;


  @BeforeClass
  public static void startServer() throws IOException {
    MockServer.startServer();
  }

  @AfterClass
  public static void stopServer() {
    MockServer.stop();
  }

  @After
  public void tearDown() {
    this.comicRepository.deleteAll();
    this.progressRepository.deleteAll();
  }

  @Test
  @DirtiesContext
  public void associatesComics() throws Exception {
    // Given
    this.integrationTestHelper.setComicsPath("src/test/resources/fixtures/incomplete");

    // When
    StepVerifier.create(this.integrationTestHelper.triggerScan(this.port))
        .expectNext("start")
        .expectNext("1")
        .expectNextCount(1)
        .expectNext("cleanUp")
        .expectNext("association")
        .expectNext("done")
        .thenCancel()
        .verify();

    // Then
    final List<Comic> comics = this.comicRepository.findAll();
    assertThat(comics.size()).isEqualTo(1);

    final Comic comic = comics.get(0);
    assertThat(comic.getSeries()).isEqualTo("Batman");
    assertThat(comic.getPublisher()).isEqualTo("DC Comics");
    assertThat(comic.getVolume()).isEqualTo("1940");
    assertThat(comic.getNumber()).isEqualTo("701");
    assertThat(comic.getTitle()).isEqualTo("R.I.P. The Missing Chapter, Part 1: The Hole In Things");
    assertThat(comic.getSummary().length()).isEqualTo(391);
    assertThat(comic.getYear()).isEqualTo((short) 2010);
    assertThat(comic.getMonth()).isEqualTo((short) 9);
    assertThat(comic.getCharacters())
      .isEqualTo("Alfred Pennyworth, Batman, Doctor Hurt, Ellie, Jezebel Jet, Martha Wayne, Superman, Thomas Wayne");
    assertThat(comic.getTeams())
      .isEqualTo("Superman/Batman");
    assertThat(comic.getLocations())
      .isEqualTo("Batcave, Gotham City, Wayne Manor");
    assertThat(comic.getWriter()).isEqualTo("Grant Morrison");
    assertThat(comic.getPenciller()).isNull();
    assertThat(comic.getInker()).isNull();
    assertThat(comic.getColorist()).isEqualTo("Ian Hannin");
    assertThat(comic.getLetterer()).isEqualTo("Jared K. Fletcher");
    assertThat(comic.getCoverArtist()).isEqualTo("Tony Daniel");
    assertThat(comic.getEditor()).isEqualTo("Dan DiDio, Janelle Asselin (Siegel), Mike Marts");
    assertThat(comic.getWeb()).isEqualTo("https://comicvine.gamespot.com/batman-701-rip-the-missing-chapter-part-1-the-hole/4000-224555/");
  }
}