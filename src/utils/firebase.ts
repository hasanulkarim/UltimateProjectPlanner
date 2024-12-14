import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDZ9YzXKXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "project-planner-xxxxx.firebaseapp.com",
  databaseURL: "https://project-planner-xxxxx.firebaseio.com",
  projectId: "project-planner-xxxxx",
  storageBucket: "project-planner-xxxxx.appspot.com",
  messagingSenderId: "xxxxxxxxxxxx",
  appId: "1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);