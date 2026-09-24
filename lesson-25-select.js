const lessonSelect = document.querySelector("#lesson-select");
if (lessonSelect) {
  lessonSelect.options[0].textContent = "第 1–25 课";
  lessonSelect.add(new Option("第 25 课", "25"));
}
