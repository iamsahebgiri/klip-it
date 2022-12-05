import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
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
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "/",
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, (match) => map[match]);
}

function linkify(text) {
  var urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
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
      $("#contents").prepend(`
          <div data-id=${id} class="bg-white p-6 shadow-sm sm:rounded-md w-full">
            <div>
              <div class="text-sm leading-5 text-slate-600 overflow-auto font-medium prose">
                <pre>${linkify(sanitize(content))}</pre>
              </div>
            <div class="flex items-center justify-between mt-3">
              <p class="text-sm leading-5 text-slate-500">just now</p>
              <div>
                <button id="copy-btn" data-id="${id}" data-content="${sanitize(content)}" class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 rounded-sm mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </button>
                <button id="delete-btn" data-id="${id}" class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `);
    }
  });

  // $("#content").on("keyup", function (e) {
  //   $(this).height(192)
  //   $(this).height($(this).prop('scrollHeight'));
  // });

  const q = query(
    collection(db, "contents"),
    orderBy("createdAt", "desc"),
    limit(12)
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const { id, content, createdAt } = doc.data();
    $("#contents").append(`
          <div data-id=${id} class="bg-white p-6 shadow-sm sm:rounded-md w-full">
            <div>
              <div class="text-sm leading-5 text-slate-600 overflow-auto font-medium prose">
                <pre>${linkify(content)}</pre>
              </div>
            <div class="flex items-center justify-between mt-3">
              <p class="text-sm leading-5 text-slate-500">${
                createdAt === null
                  ? "just now"
                  : dayjs(createdAt.toDate()).fromNow()
              }</p>
              <div>
                <button id="copy-btn" data-id="${id}" data-content="${content}" class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 rounded-sm mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-slate-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  
                </button>
                <button id="delete-btn" data-id="${id}" class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-red-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>

                </button>
              </div>
            </div>
          </div>
        </div>
          `);
  });

  $("#contents").on("click", "#delete-btn", async function () {
    const id = $(this).attr("data-id");
    await deleteContent(db, id);
    $(`div[data-id=${id}]`).remove();

    $("#toast-delete").addClass("show");
    setTimeout(() => $("#toast-delete").removeClass("show"), 3000);
  });

  $("#contents").on("click", "#copy-btn", async function () {
    const content = $(this).attr("data-content");

    navigator.clipboard.writeText(content);
    $("#toast-copy").addClass("show");
    setTimeout(() => $("#toast-copy").removeClass("show"), 3000);
  });
});
