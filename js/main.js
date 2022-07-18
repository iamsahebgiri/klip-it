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

const firebaseConfig = {
  apiKey: "AIzaSyD0qFm8j6OF7U7-KVJQeUC1gHsnoWVOUq4",
  authDomain: "klip-it.firebaseapp.com",
  projectId: "klip-it",
  storageBucket: "klip-it.appspot.com",
  messagingSenderId: "732308781357",
  appId: "1:732308781357:web:0dbaee0cb05ca8c53cbba4",
  measurementId: "G-9HSEDH4RP2",
};

function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '/',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match) => (map[match]));
}

function linkify(text) {
  var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function (url) {
    return `<a href="${url}" class="underline decoration-blue-500 decoration-2" target="_blank">${url}</a>`;
  });
}

async function deleteContent(db, id) {
  await deleteDoc(doc(db, "contents", id));
}

async function postContent(db, content) {
  const docRef = await doc(collection(db, "contents"));
  await setDoc(docRef, {
    id: docRef.id,
    content: sanitize(content),
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

  // $("#content").on("keyup", function (e) {
  //   $(this).height(192)
  //   $(this).height($(this).prop('scrollHeight'));
  // });

  const q = query(collection(db, "contents"), orderBy("createdAt"));
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const doc = change.doc.data();
        console.log("Added: ", doc);
        $("#contents").prepend(`
          <div data-id=${doc.id} class="bg-white p-6 shadow-sm sm:rounded-md w-full">
            <div>
              <div class="text-sm leading-5 text-slate-600 overflow-auto font-medium prose">
                <pre>${linkify(doc.content)}</pre>
              </div>
            <div class="flex items-center justify-between mt-3">
              <p class="text-sm leading-5 text-slate-500">${doc.createdAt === null ? "just now" : dayjs(doc.createdAt.toDate()).fromNow()}</p>
              <div>
                <button id="copy-btn" data-id="${doc.id}" data-content="${doc.content}" class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 rounded-sm mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
          `);
      } else if (change.type === "removed") {
        $(`div[data-id="${change.doc.data().id}"]`).remove();
      }
    });
  });

  $("#contents").on("click", "#delete-btn", async function () {
    await deleteContent(db, $(this).attr("data-id"));
  });
  $("#contents").on("click", "#copy-btn", async function () {
    // await deleteContent(db, $(this).attr("data-id"));
    const content = $(this).attr("data-content");

    navigator.clipboard.writeText(content)
    $("#toast").addClass("show");
    setTimeout(() => $("#toast").removeClass("show"), 3000)
  });
});
