var availableTags = [];

//Đưa gợi ý cho tìm kiếm bài hát
fetch('/rest/Song')
	.then(response => response.json())
	.then(data => {
		// Lấy danh sách các nameSong từ dữ liệu nhận được từ REST API
		availableTags = data.map(song => song.name);

		// Khởi tạo autocomplete với danh sách availableTags
		$("#autoCompleteSong").autocomplete({
			source: availableTags
		});
	})
	.catch(error => console.error('Lỗi:', error));

//Đưa gợi ý cho tìm kiếm nghệ sĩ
fetch('/rest/Artist')
	.then(response => response.json())
	.then(data => {

		// Lấy danh sách các stageName từ dữ liệu nhận được từ REST API

		availableTags = data.map(artist => artist.stageName);

		// Khởi tạo autocomplete với danh sách availableTags
		$("#autoCompleteArtist").autocomplete({
			source: availableTags
		});
	})
	.catch(error => console.error('Lỗi:', error));
	

	//Đưa gợi ý cho tìm kiếm album
fetch('/rest/Album')
	.then(response => response.json())
	.then(data => {
		// Lấy danh sách các nameAlbum từ dữ liệu nhận được từ REST API
		availableTags = data.map(album => album.name);

		// Khởi tạo autocomplete với danh sách availableTags
		$("#autoCompleteAlbum").autocomplete({
			source: availableTags
		});
	})
	.catch(error => console.error('Lỗi:', error));
	

	

	
	

