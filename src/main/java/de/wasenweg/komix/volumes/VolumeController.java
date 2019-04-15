package de.wasenweg.komix.volumes;

import de.wasenweg.komix.comics.Comic;
import de.wasenweg.komix.progress.ProgressService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.security.Principal;

@RequestMapping("/api/volumes")
@RestController
public class VolumeController {

    @Autowired
    private ProgressService progressService;

    @PutMapping("/markAsRead")
    public void markAsRead(@Valid @RequestBody final Volume volume, final Principal principal) {
        this.progressService.updateVolume(principal.getName(), volume, true);
    }

    @PutMapping("/markAsUnread")
    public void markAsUnread(@Valid @RequestBody final Volume volume, final Principal principal) {
        this.progressService.updateVolume(principal.getName(), volume, false);
    }

    @PutMapping("/markAllAsReadUntil")
    public void markAsUnread(@Valid @RequestBody final Comic comic, final Principal principal) {
        this.progressService.updateVolumeUntil(principal.getName(), comic);
    }
}