import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

import {
  firebaseApp,
} from './config'


export const auth =
  getAuth(firebaseApp)


const LOGIN_EMAIL =
  'adriantorr9@gmail.com'


export async function login(
  code: string
): Promise<User> {

  const credential =
    await signInWithEmailAndPassword(
      auth,
      LOGIN_EMAIL,
      code
    )

  return credential.user
}


export async function logout() {
  await signOut(auth)
}


export function observeAuth(
  callback: (
    user: User | null
  ) => void
) {
  return onAuthStateChanged(
    auth,
    callback
  )
}