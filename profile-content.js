// عدّل هذا الملف لتحديث السيرة الذاتية والشهادات بالعربي والإنكليزي.
window.portfolioProfile = {
  // مثال: "assets/my-cv.pdf". اتركها فارغة لإخفاء زر التحميل.
  cvPdf: "assets/Mohammed_R_Yaseen_CV_1.pdf",

  // أضف عنصرًا داخل القائمة لعرض شهادة، أو احذف العنصر لإخفائها.
  // أضف group: "learning" إذا أردت ظهور العنصر تحت التعلّم والتطبيق.
  certificates: [
    {
      title: { en: "Introduction to Cybersecurity", ar: "مقدمة في الأمن السيبراني" },
      issuer: "Cisco Networking Academy",
      url: ""
    },
    {
      title: { en: "Networking Basics", ar: "أساسيات الشبكات" },
      issuer: "Cisco Networking Academy",
      icon: "network",
      url: "https://www.credly.com/badges/c7f9d331-5cd3-436d-8120-9217d57fc213/public_url"
    },
    {
      group: "learning",
      title: { en: "Harvard CS50x", ar: "Harvard CS50x" },
      description: {
        en: "Completed through study and hands-on project work.",
        ar: "أكملت الدورة من خلال الدراسة والتطبيق العملي على المشاريع."
      },
      issuer: "Harvard University",
      url: "https://cs50.harvard.edu/certificates/c67e9a26-4d8a-4f92-ba73-6cde547b7b7c"
    }
  ]
};
