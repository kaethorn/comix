package de.wasenweg.alfred.integration;

import de.wasenweg.alfred.AlfredApplication;
import de.wasenweg.alfred.TestUtil;
import de.wasenweg.alfred.comics.Comic;
import de.wasenweg.alfred.comics.ComicRepository;
import de.wasenweg.alfred.progress.ProgressRepository;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;

import java.io.File;
import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { AlfredApplication.class }, webEnvironment = WebEnvironment.RANDOM_PORT)
@DirtiesContext
@EnableAutoConfiguration
@RequiredArgsConstructor(onConstructor_ = @Autowired)
@ActiveProfiles("test")
public class ScannerIngrationTest {

  @TempDir
  public File testBed;

  @LocalServerPort
  private int port;

  private final ComicRepository comicRepository;
  private final ProgressRepository progressRepository;
  private final IntegrationTestHelper helper;

  @AfterEach
  public void tearDown() {
    this.comicRepository.deleteAll();
    this.progressRepository.deleteAll();
  }

  @Test
  public void emittsScanProgressEvents() throws Exception {
    // Given
    this.helper.setComicsPath("src/test/resources/fixtures/simple", this.testBed);

    // When
    StepVerifier.create(TestUtil.triggerScan(this.port))
        .expectNext("start")
        .expectNext("1")
        .expectNext(this.testBed.getAbsolutePath() + "/Batman 402 (1940).cbz")
        .expectNext("cleanUp")
        .expectNext("association")
        .expectNext("done")
        .thenCancel()
        .verify(Duration.ofSeconds(2L));

    // Then
    final List<Comic> comics = this.comicRepository.findAll();
    assertThat(comics.size()).isEqualTo(1);
  }
}
