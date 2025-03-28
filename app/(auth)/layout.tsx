"use client"

const AuthLayout = ({
  children
}: {
  children: React.ReactNode
  }) => {
  
  
  return ( 
<div className="bg-[#47724B] max-h-screen overflow-y-hidden">
{children}
    </div>
   );
}
 
export default AuthLayout;