"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Card, CardFooter } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { EmailConfirmationPending } from "./EmailConfirmationPending";
import { Button } from "@/components/ui/button";
import { PasswordRecoveryForm } from "./PasswordRecoveryForm";
import { createClient } from "@/utils/supabase/client";
import { fetchData } from "@/app/(dashboard)/(routes)/teacher/courses/custom/fetchData";
// import { configNav } from "../modules/routes";

export default function AuthPage() {
  // const router = useRouter();
  const supabase = createClient();
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [email, setEmail] = useState("");


  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        console.log("user registrado:", user)
        setIsLoggedIn(true);
        redirect("/")
      
      } else {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=>{
    if(isLoggedIn){
      // const { navMain } = configNav
      // redirect(navMain[0].route)
      redirect("/")
    }
  },[isLoggedIn])

  if (isLoggedIn) {
    return null;
  }

  const handleSignupSuccess = () => {
    setShowConfirmationMessage(true);
  };

  if (showConfirmationMessage) {
    return <EmailConfirmationPending email={email} />;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="shadow-md w-[25rem]">
        {isLoginFormVisible ? (
          <>
            {isPasswordRecovery ? (
              <PasswordRecoveryForm />
            ) : (
              <LoginForm
                onAuthStateChange={() => 
                  setIsLoggedIn(true)}
                email={email}
                setEmail={setEmail}
                setIsPasswordRecovery={setIsPasswordRecovery}
              />
            )}
          </>
        ) : (
          <SignupForm
            onSignupSuccess={handleSignupSuccess}
            setEmail={setEmail}
          />
        )}
        <CardFooter className="p-4 flex justify-around">
          {isLoginFormVisible ? (
            <Button
              variant="ghost"
              onClick={() => setIsLoginFormVisible(false)}
            >
              ¿Crear Cuenta?
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                setIsPasswordRecovery(false);
                setIsLoginFormVisible(true);
              }}
            >
              ¿Iniciar Sesión?
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
