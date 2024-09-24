package tlk.dev.restController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tlk.dev.service.StatisticsService;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/statistics")
public class ThongKeRestController {
     @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/totals")
    public Map<String, Integer> getTotals() {
        Map<String, Integer> totals = new HashMap<>();
        totals.put("total_songs", statisticsService.getTotalSongs());
        totals.put("total_accounts", statisticsService.getTotalAccounts());
        totals.put("total_albums", statisticsService.getTotalAlbums());
        totals.put("total_topics", statisticsService.getTotalTopics());
        return totals;
    }

    @GetMapping("/artists")
    public List<Object[]> getAllArtistStatistics() {
        return statisticsService.getAllArtistStatistics();
    }

    @GetMapping("/artist/{name}")
    public List<Object[]> getArtistStatisticsByName(@PathVariable String name) {
        return statisticsService.getArtistStatisticsByName(name);
    }

    @GetMapping("/top-songs-by-views")
    public List<Object[]> getTopSongsByViews() {
        return statisticsService.getTop10SongsByViews();
    }

    @GetMapping("/top-songs-by-favorites")
    public List<Object[]> getTopSongsByFavorites() {
        return statisticsService.getTop10SongsByFavorites();
    }
}
