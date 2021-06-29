let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("awaiting", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkData();
  }
};

request.onerror = function (event) {
  console.log("Error" + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["awaiting"], "readwrite");
  const store = transaction.objectStore("awaiting");
  store.add(record);
}

function checkData() {
  const transaction = db.transaction(["awaiting"], "readwrite");
  const store = transaction.objectStore("awaiting");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(["awaiting"], "readwrite");
          const store = transaction.objectStore("awaiting");
          store.clear();
        });
    }
  };
}
function deletePending() {
  const transaction = db.transaction(["awaiting"], "readwrite");
  const store = transaction.objectStore("awaiting");
  store.clear();
}
window.addEventListener("online", checkData);