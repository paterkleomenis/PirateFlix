function app() {
  return {
    apiKey: "",
    content: [],
    currentTab: "movies",
    language: "en",
    searchQuery: "",
    currentPage: 1,
    showWatchLater: false,
    watchLaterItems: [],
    watchLaterCount: 0,
    showModal: false,
    selectedContent: null,
    currentVideoUrl: "",
    selectedSeason: 1,
    selectedEpisode: 1,
    seasons: [],
    episodes: [],
    selectedSource: "multiembed",
    availableSources: availableSources,
    showClearConfirm: false,
    genres: [],
    selectedGenre: "",
    minRating: "",
    filteredContent: [],
    mobileMenu: false,
    sortBy: "popularity.desc",

    async init() {
      const savedItems = localStorage.getItem("watchLater");
      if (savedItems) {
        this.watchLaterItems = JSON.parse(savedItems);
        this.watchLaterCount = this.watchLaterItems.length;
      }

      await this.fetchGenres();
      await this.fetchContent();

      this.$watch("currentTab", async () => {
        this.currentPage = 1;
        this.selectedGenre = "";
        this.minRating = "";
        await this.fetchGenres();
        await this.fetchContent();
      });
    },

    async fetchGenres() {
      const baseUrl = "https://api.themoviedb.org/3";
      const endpoint =
        this.currentTab === "movies" ? "genre/movie/list" : "genre/tv/list";
      const url = `${baseUrl}/${endpoint}?api_key=${this.apiKey}&language=${this.language}&with_original_language=en`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        this.genres = data.genres;
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    },

    getGenreName(genreId) {
      const genre = this.genres.find((g) => g.id === parseInt(genreId));
      return genre ? genre.name : "";
    },

    async applyFilters() {
      const baseUrl = "https://api.themoviedb.org/3/discover";
      const endpoint = this.currentTab === "movies" ? "movie" : "tv";

      let params = new URLSearchParams({
        api_key: this.apiKey,
        language: `${this.language}-${this.language.toUpperCase()}`,
        with_original_language: `en`,
        page: this.currentPage,
        sort_by: this.sortBy,
      });

      if (this.selectedGenre) {
        params.append("with_genres", this.selectedGenre);
      }

      if (this.minRating) {
        params.append("vote_average.gte", this.minRating);
      }

      const url = `${baseUrl}/${endpoint}?${params.toString()}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        this.content = data.results;
        this.filteredContent = this.content;
      } catch (error) {
        console.error("Error applying filters:", error);
      }
    },

    async fetchContent() {
      const baseUrl = "https://api.themoviedb.org/3";
      const endpoint =
        this.currentTab === "movies" ? "movie/popular" : "tv/popular";
      const url = `${baseUrl}/${endpoint}?api_key=${this.apiKey}&language=${this.language}-${this.language.toUpperCase()}&with_original_language=en&page=${this.currentPage}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        this.content = data.results;
        this.applyFilters();
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    },

    async searchContent() {
      if (!this.searchQuery) {
        await this.applyFilters();
        return;
      }

      const baseUrl = "https://api.themoviedb.org/3";
      const searchQuery = this.searchQuery.trim();

      // Check if searching for person (actor/director)
      if (searchQuery.startsWith("@")) {
        const personName = searchQuery.substring(1);
        if (!personName) {
          await this.applyFilters();
          return;
        }

        // First search for the person
        const personUrl = `${baseUrl}/search/person?api_key=${this.apiKey}&query=${encodeURIComponent(personName)}`;
        try {
          const personResponse = await fetch(personUrl);
          const personData = await personResponse.json();
          const person = personData.results[0];

          if (person) {
            // Get movies/shows the person was involved in
            const creditsUrl = `${baseUrl}/person/${person.id}/combined_credits?api_key=${this.apiKey}`;
            const creditsResponse = await fetch(creditsUrl);
            const creditsData = await creditsResponse.json();

            // Filter based on current tab (movie/tv)
            this.content = creditsData[
              this.currentTab === "movies" ? "cast" : "crew"
            ]
              .filter((item) =>
                this.currentTab === "movies"
                  ? item.media_type === "movie"
                  : item.media_type === "tv",
              )
              .slice(0, 20); // Limit to 20 results
          } else {
            this.content = [];
          }
        } catch (error) {
          console.error("Error searching person:", error);
          this.content = [];
        }
      } else {
        // Regular title search
        const endpoint = this.currentTab === "movies" ? "movie" : "tv";
        const url = `${baseUrl}/search/${endpoint}?api_key=${this.apiKey}&query=${encodeURIComponent(searchQuery)}&language=${this.language}-${this.language.toUpperCase()}&with_original_language=en&page=${this.currentPage}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          this.content = data.results;
        } catch (error) {
          console.error("Error searching content:", error);
          this.content = [];
        }
      }

      // Apply additional filters
      this.filteredContent = this.content.filter((item) => {
        if (
          this.selectedGenre &&
          !item.genre_ids?.includes(parseInt(this.selectedGenre))
        ) {
          return false;
        }
        if (this.minRating && item.vote_average < parseFloat(this.minRating)) {
          return false;
        }
        return true;
      });
    },

    async openContent(item) {
      this.selectedContent = item;
      this.showModal = true;

      if (this.currentTab === "shows") {
        const url = `https://api.themoviedb.org/3/tv/${item.id}?api_key=${this.apiKey}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          this.seasons = Array.from(
            { length: data.number_of_seasons },
            (_, i) => i + 1,
          );
          this.updateEpisodes();
        } catch (error) {
          console.error("Error fetching seasons:", error);
        }
      }
      this.updateVideoUrl();
    },

    getSourceUrl(sourceId, type, params) {
      const source = this.availableSources.find((s) => s.id === sourceId);
      if (!source) return "";

      let url = source.urls[type];
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, value);
      });
      return url;
    },

    updateVideoUrl() {
      const source = this.availableSources.find(
        (s) => s.id === this.selectedSource,
      );
      if (!source) return "";

      const params =
        this.currentTab === "shows"
          ? {
              id: this.selectedContent.id,
              season: this.selectedSeason,
              episode: this.selectedEpisode,
            }
          : { id: this.selectedContent.id };

      this.currentVideoUrl = this.getSourceUrl(
        this.selectedSource,
        this.currentTab === "shows" ? "tv" : "movie",
        params,
      );
    },

    async updateEpisodes() {
      const url = `https://api.themoviedb.org/3/tv/${this.selectedContent.id}/season/${this.selectedSeason}?api_key=${this.apiKey}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        this.episodes = Array.from(
          { length: data.episodes.length },
          (_, i) => i + 1,
        );
        this.selectedEpisode = 1;
      } catch (error) {
        console.error("Error fetching episodes:", error);
      }
    },

    loadEpisode() {
      this.updateVideoUrl();
    },

    async changePage(page) {
      this.currentPage = page;
      if (this.searchQuery) {
        await this.searchContent();
      } else {
        await this.fetchContent();
      }
    },

    toggleWatchLater(item) {
      const index = this.watchLaterItems.findIndex((i) => i.id === item.id);
      if (index === -1) {
        this.watchLaterItems.push({
          ...item,
          type: this.currentTab === "movies" ? "movie" : "tv",
        });
      } else {
        this.watchLaterItems.splice(index, 1);
      }
      this.watchLaterCount = this.watchLaterItems.length;
      localStorage.setItem("watchLater", JSON.stringify(this.watchLaterItems));
    },

    isInWatchLater(item) {
      return this.watchLaterItems.some((i) => i.id === item.id);
    },

    clearWatchLater() {
      this.showClearConfirm = true;
    },

    doClearWatchLater() {
      this.watchLaterItems = [];
      this.watchLaterCount = 0;
      localStorage.setItem("watchLater", JSON.stringify([]));
      this.showClearConfirm = false;
    },

    pickRandom() {
      const randomItem =
        this.filteredContent[
          Math.floor(Math.random() * this.filteredContent.length)
        ];
      if (randomItem) {
        window.location.href = `watch.html?id=${randomItem.id}&type=${this.currentTab === "movies" ? "movie" : "tv"}`;
      }
    },
  };
}

/* Search Bar */
document
  .querySelector(".search-container input")
  .addEventListener("mousemove", (e) => {
    const container = e.target.parentElement;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * 100) / rect.width;
    const y = ((e.clientY - rect.top) * 100) / rect.height;
    container.style.setProperty("--mouse-x", x + "%");
    container.style.setProperty("--mouse-y", y + "%");
  });
