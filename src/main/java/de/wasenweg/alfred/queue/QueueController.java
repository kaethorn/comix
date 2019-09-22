package de.wasenweg.alfred.queue;

import de.wasenweg.alfred.comics.Comic;
import de.wasenweg.alfred.comics.ComicQueryRepositoryImpl;
import de.wasenweg.alfred.util.BaseController;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.Resources;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController extends BaseController<Comic> {

  @Autowired
  private ComicQueryRepositoryImpl comicQueryRepository;

  @GetMapping()
  public Resources<Resource<Comic>> get() {
    return this.wrap(this.comicQueryRepository.findAllWithErrors());
  }
}