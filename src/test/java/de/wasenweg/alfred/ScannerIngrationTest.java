package de.wasenweg.alfred;

import de.wasenweg.alfred.comics.Comic;
import de.wasenweg.alfred.comics.ComicRepository;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = { AlfredApplication.class }, webEnvironment = WebEnvironment.RANDOM_PORT)
@EnableAutoConfiguration
@ActiveProfiles(profiles = "test")
public class ScannerIngrationTest {

  @LocalServerPort
  private int port;

  @Autowired
  private ComicRepository comicRepository;

  @Autowired
  private IntegrationTestHelper integrationTestHelper;

  @After
  public void tearDown() {
    comicRepository.deleteAll();
  }

  @Test
  public void emittsScanProgressEvents() throws Exception {
    // Given
    integrationTestHelper.setComicsPath("src/test/resources/fixtures/simple");

    // When
    StepVerifier.create(integrationTestHelper.triggerScan(port))
        .expectNext("")
        .expectNext("1")
        .expectNext("src/test/resources/fixtures/simple/Batman 402 (1940).cbz")
        .expectNext("")
        .thenCancel()
        .verify(Duration.ofSeconds(2L));

    // Then
    final List<Comic> comics = comicRepository.findAll();
    assertThat(comics.size()).isEqualTo(1);
  }
}
