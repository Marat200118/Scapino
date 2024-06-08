const updateSectionDisplay = (currentSection, items) => {

  console.log(`I'm here with ${currentSection}`);

  document.querySelector(".introduction").style.display = "none";
  document.querySelector(".in-between").style.display = "none";
  document.querySelector(".misogyny").style.display = "none";
  document.querySelector(".life").style.display = "none";
  document.querySelector(".societal-norms").style.display = "none";
  document.querySelector(".reproductive-rights").style.display = "none";
  // document.querySelectorAll("video").forEach((video) => {
  //   video.pause();
  // });


  switch (currentSection) {
    case "start":
      document.querySelector(".introduction").style.display = "block";
      document.querySelectorAll("video").forEach((video) => {
        video.pause();
      });
      break;
    case "in-between":
      document.querySelector(".in-between").style.display = "block";
      document.querySelectorAll("video").forEach((video) => {
        video.pause();
      });
      break;
    case "content":
      const highlightedItem = items.find((item) => item.isHighlighted);
      console.log(highlightedItem.section)
      if (highlightedItem) {
        document.querySelector(`.${highlightedItem.section}`).style.display = "block";
      } else {
        console.log("No highlighted item found");
      };
      break;

    default:
      document.querySelector(".introduction").style.display = "block";
      break;
  };
};

export { updateSectionDisplay };