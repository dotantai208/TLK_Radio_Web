package tlk.dev.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tlk.dev.dao.StatisticsRepository;

@Service
public class StatisticsService {
         @Autowired
    private StatisticsRepository repository;

    public List<Object[]> getAllArtistStatistics() {
        return repository.getAllArtistStatistics();
    }

    public List<Object[]> getArtistStatisticsByName(String artistName) {
        return repository.getArtistStatisticsByName(artistName);
    }

    public List<Object[]> getTop10SongsByViews() {
        return repository.findTop10SongsByViews();
    }

    public List<Object[]> getTop10SongsByFavorites() {
        return repository.findTop10SongsByFavorites();
    }

    public int getTotalSongs() {
        return repository.getTotalSongs();
    }

    public int getTotalAccounts() {
        return repository.getTotalAccounts();
    }

    public int getTotalAlbums() {
        return repository.getTotalAlbums();
    }

    public int getTotalTopics() {
        return repository.getTotalTopics();
    }
}
