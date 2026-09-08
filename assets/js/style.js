// 이벤트 미리보기와 모달 찾기
const openEvent = document.querySelector("#openEvent");
const closeEvent = document.querySelector("#closeEvent");
const eventModal = document.querySelector("#eventModal");

let previousOverflow = "";

// 미리보기 클릭 → 모달 열기
openEvent.addEventListener("click", () => {
  previousOverflow = document.documentElement.style.overflow;

  eventModal.showModal();
  eventModal.scrollTop = 0;

  // 뒤쪽 페이지 스크롤 잠금
  document.documentElement.style.overflow = "hidden";
});

// 닫기 버튼 클릭 → 모달 닫기
closeEvent.addEventListener("click", () => {
  eventModal.close();
});

// 모달 바깥 배경 클릭 → 닫기
eventModal.addEventListener("click", (event) => {
  if (event.target !== eventModal) return;

  const rect = eventModal.getBoundingClientRect();

  const isOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (isOutside) {
    eventModal.close();
  }
});

// 버튼·배경 클릭 또는 Esc로 닫혔을 때 스크롤 복구
eventModal.addEventListener("close", () => {
  document.documentElement.style.overflow = previousOverflow;
});

// Event js
document.querySelector("#viewEvent").addEventListener("click", () => {
  document.querySelector("#eventModal").showModal();
});
