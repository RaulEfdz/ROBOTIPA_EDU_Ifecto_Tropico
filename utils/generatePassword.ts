export const generatePassword = () => {
     const length = 12;
     const lowercase = "abcdefghijklmnopqrstuvwxyz";
     const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
     const numbers = "0123456789";
     const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
     const allChars = lowercase + uppercase + numbers + symbols;
   
     let password = "";
     
     // Ensure at least one character from each category
     password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
     password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
     password += numbers.charAt(Math.floor(Math.random() * numbers.length));
     password += symbols.charAt(Math.floor(Math.random() * symbols.length));
   
     // Fill the rest of the password
     for (let i = password.length; i < length; i++) {
       password += allChars.charAt(Math.floor(Math.random() * allChars.length));
     }
   
     // Shuffle the password
     password = password.split('').sort(() => 0.5 - Math.random()).join('');
   
     return password;
   };