import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import $ from "jquery";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./style.css";

const firebaseConfig = {
  apiKey: "AIzaSyD0qFm8j6OF7U7-KVJQeUC1gHsnoWVOUq4",
  authDomain: "klip-it.firebaseapp.com",
  projectId: "klip-it",
  storageBucket: "klip-it.appspot.com",
  messagingSenderId: "732308781357",
  appId: "1:732308781357:web:0dbaee0cb05ca8c53cbba4",
  measurementId: "G-9HSEDH4RP2",
};

function HTMLescape(html) {
  return document
    .createElement("div")
    .appendChild(document.createTextNode(html)).parentNode.innerHTML;
}

async function deleteContent(db, id) {
  await deleteDoc(doc(db, "contents", id));
}

async function postContent(db, content) {
  const docRef = await doc(collection(db, "contents"));
  await setDoc(docRef, {
    id: docRef.id,
    content: HTMLescape(content),
    createdAt: serverTimestamp(),
  });
  return docRef;
}

$(async function () {
  const app = initializeApp(firebaseConfig);
  getAnalytics(app);
  const db = getFirestore(app);
  dayjs.extend(relativeTime);

  $("form").on("submit", async function (e) {
    e.preventDefault();
    const content = $("#content").val();
    if (content !== "") {
      const { id } = await postContent(db, content);
      console.log("Saved with id: ", id);
      $("#content").val("");
    }
  });

  const q = query(collection(db, "contents"), orderBy("createdAt"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const doc = change.doc.data();
        console.log();
        $("#contents").prepend(`
          <div data-id=${
            doc.id
          } class="bg-white p-6 shadow sm:rounded-md w-full">
            <div>
              <p class="text-sm leading-5 text-gray-600">
                ${doc.content}
              </p>
              <div class="flex items-center justify-between mt-3">
                <p class="text-sm leading-5 text-gray-500">${
                  doc.createdAt === null
                    ? "just now"
                    : dayjs(doc.createdAt.toDate()).fromNow()
                }</p>
                <button data-id=${
                  doc.id
                } class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          `);
      } else if (change.type === "removed") {
        $(`div[data-id="${change.doc.data().id}"]`).remove();
      }
    });
  });

  $("#contents").on("click", "button", async function () {
    await deleteContent(db, $(this).attr("data-id"));
  });
});
