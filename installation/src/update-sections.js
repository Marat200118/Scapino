const updateSectionDisplay = (currentSection) => {
  // let localSection = currentSection;

  // if (isRemoteActive) {
  //   localSection = currentSection;
  // }

  console.log(`I'm here with ${currentSection}`);

  document.querySelector(".introduction").style.display = "none";
  document.querySelector(".in-between").style.display = "none";
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
      break;
    case "in-between":
      document.querySelector(".in-between").style.display = "block";
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
      break;
    default:
      document.querySelector(".introduction").style.display = "block";
      break;
  }
};

export { updateSectionDisplay };
