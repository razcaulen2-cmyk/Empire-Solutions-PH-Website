import "./styles/main.css";
import homePage from "./pages/home.html?raw";
import newsPage from "./pages/news.html?raw";
import servicesPage from "./pages/services.html?raw";
import projectsPage from "./pages/projects.html?raw";
import aboutPage from "./pages/about.html?raw";
import contactPage from "./pages/contact.html?raw";
import { Application } from "./application/Application.js";

export const routes = Object.freeze([
  { name: "home", path: "/", title: "Home", markup: homePage },
  { name: "news", path: "/news", title: "News & Blogs", markup: newsPage },
  { name: "services", path: "/services", title: "Our Services", markup: servicesPage },
  { name: "projects", path: "/projects", title: "Our Projects", markup: projectsPage },
  { name: "about", path: "/about", title: "About Us", markup: aboutPage },
  { name: "contact", path: "/contact", title: "Contact Us", markup: contactPage },
]);

const application = new Application({
  routes,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
});

application.start();
