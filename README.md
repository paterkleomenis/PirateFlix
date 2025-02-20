# PirateFlix

PirateFlix is a web-based streaming front-end that aggregates popular movies and TV shows using The Movie Database (TMDb) API. The project provides a sleek, responsive interface with modern animations, dark theme aesthetics, and several advanced features such as search filters, random pick, watch later list management, and multiple streaming source support.

---

## Features

- **Responsive Design:** Fully responsive layout for desktop and mobile devices.
- **Dynamic Content:** Fetches and displays popular movies and TV shows from the TMDb API.
- **Advanced Filtering:** Filter content by genre, rating, and sort order.
- **Search Functionality:** Supports title search along with special “@” prefix for searching by person (actor/director).
- **Watch Later List:** Add and remove content to a local watch later list with localStorage persistence.
- **Modal & Animations:** Uses smooth modal animations, hover effects, and CSS animations for an enhanced user interface.
- **Multiple Streaming Sources:** Supports numerous streaming source providers by dynamically generating embed URLs.
- **Torrent Information (for TV Shows):** Fetches torrent info from a proxy-enabled torrent search provider.
- **Particle Background:** Beautiful animated background using particles.js.
- **Keyboard Shortcuts:** Focus on search using shortcut keys such as ⌘K / Ctrl+K.

---

## Project Structure

The project is organized as follows:

- **index.html**
  The main entry point which features the user interface and navigation for movies and TV shows.

- **css/**
  - `index.css`: Main styling for the site with custom animations, gradients, and effects.
  - `watch.css`: Styles specifically for the watch page showing detailed content info.

- **js/**
  - `index.js`: Contains the main application logic for fetching content, filtering, searching, and managing watch later functionality using Alpine.js.
  - `watch.js`: Handles the logic for the watch page, updating video URLs, displaying seasons/episodes, and managing torrent info.
  - `particles.js`: Configuration and initialization of the particles.js background.
  - `sources.js`: List of supported streaming sources and their URL templates.

---

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- [Alpine.js](https://alpinejs.dev/) for reactive state management
- [Tailwind CSS](https://tailwindcss.com/) for rapid UI development
- [particles.js](https://vincentgarreau.com/particles.js/) for animated backgrounds
- [TMDb API](https://www.themoviedb.org/documentation/api) for content data
- CSS Animations and Transitions

---

## Setup & Installation

1. **Clone the Repository**

   Open your terminal and run:

   git clone https://github.com/paterkleomenis/PirateFlix.git

2. **Navigate to the Project Directory**

   cd PirateFlix

3. **API Key Setup**

   Obtain an API key from [TMDb](https://www.themoviedb.org/documentation/api) and update the `apiKey` variable in both `js/index.js` and `js/watch.js`.

4. **Install Dependencies (Optional)**

   Since the project uses CDN links for Alpine.js, Tailwind CSS, and particles.js, no additional setup is required. However, you can serve the project locally using a static server. For example, with Node.js installed you can use:

   npx serve .

5. **Run the Project**

   Open your browser and navigate to the local development URL (e.g., http://localhost:5000/) provided by your static server.

---


## Contributing

Contributions and improvements are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with detailed information about your changes.

---
