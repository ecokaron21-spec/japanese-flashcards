window.lessonCards = window.lessonCards.flat();
const optionalPoliteWeather = window.lessonCards.find((card) => card.id === "l11-044");
if (optionalPoliteWeather) optionalPoliteWeather.japanese = "いいてんきですね";
