import RegisterForm from "./components/auth/RegisterForm.jsx";
import { Toaster } from 'react-hot-toast'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider }
  from "react-router-dom"
import LoginForm from "./components/auth/LoginForm.jsx";
import ProtectedRoute from "./components/wrapper/auth.wrapper.jsx";
import Layout from "./components/Layout/Layout.jsx";
import HomePage from "./components/pages/HomePage.jsx";



const router = createBrowserRouter(createRoutesFromElements(
  <>

    <Route path="/register" element={<RegisterForm />} />
    <Route path="/login" element={<LoginForm />} />

    <Route path="/" element={
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>}>
      <Route index element={<HomePage />} />
    </Route>


  </>))


export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <RouterProvider router={router}/>
    </>


  )
}
