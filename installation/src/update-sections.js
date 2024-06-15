import { inBetween } from "./in-between";
import { initReproductiveRightsAnimation } from "./gsap";

let prevSection = null;

const updateSectionDisplay = (currentSection) => {
  if (currentSection === prevSection) {
    return;
  }
  prevSection = currentSection;

  console.log(`I'm here with ${currentSection}`);

  document.querySelector(".introduction").style.display = "none";
  document.querySelector(".in-between").style.display = "none";
  document.querySelector(".in-between-universal").style.display = "none";
  document.querySelector(".misogyny").style.display = "none";
  document.querySelector(".life").style.display = "none";
  document.querySelector(".norms").style.display = "none";
  document.querySelector(".reproductive-rights").style.display = "none";
  document.querySelectorAll("video").forEach((video) => {
    video.pause();
  });

  switch (currentSection) {
    case "start":
      document.querySelector(".introduction").style.display = "block";
      console.log("start");
      break;
    case "in-between-societal-norms":
      inBetween("camera");
      break;
    case "in-between-misogyny":
      console.log("in-between-misogyny");
      inBetween("comb");
      break;
    case "in-between-reproductive-rights":
      inBetween("test");
      break;
    case "in-between-life":
      inBetween("plaster-cast");
      break;
    case "in-between-universal":
      document.querySelector(".in-between-universal").style.display = "block";
      break;
    case "misogyny":
      document.querySelector(".misogyny").style.display = "block";
      document.querySelector(".misogyny video").play();
      break;
    case "life":
      document.querySelector(".life").style.display = "block";
      document.querySelector(".life video").play();
      break;
    case "societal-norms":
      document.querySelector(".norms").style.display = "block";
      break;
    case "reproductive-rights":
      document.querySelector(".reproductive-rights").style.display = "block";
      initReproductiveRightsAnimation(); //tryin to call the function here to reset the GSAP animation
      break;
    default:
      document.querySelector(".introduction").style.display = "block";
      break;
  }
};

export { updateSectionDisplay };
