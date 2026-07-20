import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {v4 as uuidv4} from 'uuid';
import {faker} from "@faker-js/faker";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const API_URL = import.meta.env.VITE_API_URL


export function createUuid() {
    return crypto.randomUUID ? crypto.randomUUID() : uuidv4();
}


export function getOrCreateClientId() {
    let clientId = window.localStorage.getItem("clientid");
    if (!clientId) {
        clientId = createUuid();
        window.localStorage.setItem("clientid", clientId);
    }
    return clientId;
}

export function getOrCreateSessionId() {
    let sessionId = window.localStorage.getItem("sessionid");
    if (!sessionId) {
        sessionId = createUuid();
        window.localStorage.setItem("sessionid", sessionId);
    }
    return sessionId;
}


export function getOrGenerateName() {
    let username = window.localStorage.getItem("username");

    if (!username) {
        username = faker.person.fullName();
        window.localStorage.setItem("username", username);

    }
    return username
}

export const formatTime = (timeInSeconds: number) => {
    const totalWholeSeconds = Math.floor(timeInSeconds);
    const h = Math.floor(totalWholeSeconds / 3600);
    const m = Math.floor((totalWholeSeconds % 3600) / 60);
    const s = totalWholeSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');

    // If hours > 0, include hours. Otherwise, start with minutes.
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};


export function getInitials(fullName:string) {
  const words = fullName.trim().split(' ');
  
  if (words.length === 0) return '';
  const firstInitial = words[0].charAt(0);
  const lastInitial = words.length > 1 ? words[words.length - 1].charAt(0) : '';
  return (firstInitial + lastInitial).toUpperCase();
}