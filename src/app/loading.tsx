export default function Loading() {
  return (
    // 'fixed inset-0 z-[9999]' ensures ki ye Navbar aur Footer ko bhi hide karke poori screen cover karega
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: "#FBF9F7" }}
    >
      {/* ============== VIDEO SIZE ADJUSTMENT ==============
        Abhi video ka size 'w-32 h-32' (yaani 128px by 128px) set hai.
        
        - Bada karna hai: isey 'w-48 h-48' (192px) ya 'w-64 h-64' (256px) kar dein.
        - Chhota karna hai: isey 'w-24 h-24' (96px) ya 'w-20 h-20' (80px) kar dein.
        - Custom size: 'w-[150px] h-[150px]' bhi likh sakte hain.
        ===================================================
      */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <video
          src="/loading.mp4"
          autoPlay
          loop
          muted
          playsInline // Mobile pe full-screen player open hone se rokta hai
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
