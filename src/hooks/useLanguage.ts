
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const translations = {
  en: {
    welcome: 'Welcome to LocalHub',
    shops: 'Shops',
    orders: 'Orders',
    profile: 'Profile',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    addToCart: 'Add to Cart',
    checkout: 'Checkout',
    search: 'Search',
    nearbyShops: 'Nearby Shops',
    rating: 'Rating',
    delivery: 'Delivery',
    chat: 'Chat',
    analytics: 'Analytics',
    inventory: 'Inventory',
    fullName: 'Full Name',
    phone: 'Phone',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    shopName: 'Shop Name',
    shopCategory: 'Shop Category',
    shopAddress: 'Shop Address',
    shopLocation: 'Shop Location',
    vehicleType: 'Vehicle Type',
    yourLocation: 'Your Location',
    privacyPolicy: 'Privacy Policy',
    returnPolicy: 'Return Policy',
    agreeToPrivacyPolicy: 'I agree to the Privacy Policy',
    agreeToReturnPolicy: 'I agree to the Return Policy',
    createAccount: 'Create Account',
    signIn: 'Sign In',
    welcomeBack: 'Welcome Back',
    signInToAccount: 'Sign in to your LocalHub account',
    dontHaveAccount: "Don't have an account?",
    signUpHere: 'Sign up here',
    alreadyHaveAccount: 'Already have an account?',
    signInHere: 'Sign in here',
    food: 'Food',
    groceries: 'Groceries',
    medicine: 'Medicine',
    bicycle: 'Bicycle',
    motorcycle: 'Motorcycle',
    car: 'Car',
    scooter: 'Electric Scooter',
    customer: 'Customer',
    shopOwner: 'Shop Owner',
    deliveryPartner: 'Delivery Partner',
    iAmA: 'I am a'
  },
  es: {
    welcome: 'Bienvenido a LocalHub',
    shops: 'Tiendas',
    orders: 'Pedidos',
    profile: 'Perfil',
    dashboard: 'Panel',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    addToCart: 'Añadir al Carrito',
    checkout: 'Finalizar Compra',
    search: 'Buscar',
    nearbyShops: 'Tiendas Cercanas',
    rating: 'Calificación',
    delivery: 'Entrega',
    chat: 'Chat',
    analytics: 'Análisis',
    inventory: 'Inventario',
    fullName: 'Nombre Completo',
    phone: 'Teléfono',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    shopName: 'Nombre de la Tienda',
    shopCategory: 'Categoría de la Tienda',
    shopAddress: 'Dirección de la Tienda',
    shopLocation: 'Ubicación de la Tienda',
    vehicleType: 'Tipo de Vehículo',
    yourLocation: 'Tu Ubicación',
    privacyPolicy: 'Política de Privacidad',
    returnPolicy: 'Política de Devoluciones',
    agreeToPrivacyPolicy: 'Acepto la Política de Privacidad',
    agreeToReturnPolicy: 'Acepto la Política de Devoluciones',
    createAccount: 'Crear Cuenta',
    signIn: 'Iniciar Sesión',
    welcomeBack: 'Bienvenido de Nuevo',
    signInToAccount: 'Inicia sesión en tu cuenta LocalHub',
    dontHaveAccount: '¿No tienes una cuenta?',
    signUpHere: 'Regístrate aquí',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    signInHere: 'Inicia sesión aquí',
    food: 'Comida',
    groceries: 'Abarrotes',
    medicine: 'Medicina',
    bicycle: 'Bicicleta',
    motorcycle: 'Motocicleta',
    car: 'Carro',
    scooter: 'Scooter Eléctrico',
    customer: 'Cliente',
    shopOwner: 'Dueño de Tienda',
    deliveryPartner: 'Socio de Entrega',
    iAmA: 'Soy un'
  },
  fr: {
    welcome: 'Bienvenue sur LocalHub',
    shops: 'Boutiques',
    orders: 'Commandes',
    profile: 'Profil',
    dashboard: 'Tableau de bord',
    login: 'Connexion',
    register: "S'inscrire",
    addToCart: 'Ajouter au panier',
    checkout: 'Finaliser',
    search: 'Rechercher',
    nearbyShops: 'Boutiques à proximité',
    rating: 'Notation',
    delivery: 'Livraison',
    chat: 'Chat',
    analytics: 'Analyses',
    inventory: 'Inventaire',
    fullName: 'Nom Complet',
    phone: 'Téléphone',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    shopName: 'Nom de la boutique',
    shopCategory: 'Catégorie de boutique',
    shopAddress: 'Adresse de la boutique',
    shopLocation: 'Emplacement de la boutique',
    vehicleType: 'Type de véhicule',
    yourLocation: 'Votre emplacement',
    privacyPolicy: 'Politique de confidentialité',
    returnPolicy: 'Politique de retour',
    agreeToPrivacyPolicy: "J'accepte la politique de confidentialité",
    agreeToReturnPolicy: "J'accepte la politique de retour",
    createAccount: 'Créer un compte',
    signIn: 'Se connecter',
    welcomeBack: 'Bon retour',
    signInToAccount: 'Connectez-vous à votre compte LocalHub',
    dontHaveAccount: "Vous n'avez pas de compte?",
    signUpHere: 'Inscrivez-vous ici',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    signInHere: 'Connectez-vous ici',
    food: 'Nourriture',
    groceries: 'Épicerie',
    medicine: 'Médecine',
    bicycle: 'Vélo',
    motorcycle: 'Moto',
    car: 'Voiture',
    scooter: 'Scooter électrique',
    customer: 'Client',
    shopOwner: 'Propriétaire de boutique',
    deliveryPartner: 'Partenaire de livraison',
    iAmA: 'Je suis un'
  },
  hi: {
    welcome: 'LocalHub में आपका स्वागत है',
    shops: 'दुकानें',
    orders: 'आदेश',
    profile: 'प्रोफ़ाइल',
    dashboard: 'डैशबोर्ड',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    addToCart: 'कार्ट में जोड़ें',
    checkout: 'चेकआउट',
    search: 'खोजें',
    nearbyShops: 'आस-पास की दुकानें',
    rating: 'रेटिंग',
    delivery: 'डिलीवरी',
    chat: 'चैट',
    analytics: 'विश्लेषण',
    inventory: 'इन्वेंटरी',
    fullName: 'पूरा नाम',
    phone: 'फोन',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    shopName: 'दुकान का नाम',
    shopCategory: 'दुकान की श्रेणी',
    shopAddress: 'दुकान का पता',
    shopLocation: 'दुकान का स्थान',
    vehicleType: 'वाहन का प्रकार',
    yourLocation: 'आपका स्थान',
    privacyPolicy: 'गोपनीयता नीति',
    returnPolicy: 'वापसी नीति',
    agreeToPrivacyPolicy: 'मैं गोपनीयता नीति से सहमत हूं',
    agreeToReturnPolicy: 'मैं वापसी नीति से सहमत हूं',
    createAccount: 'खाता बनाएं',
    signIn: 'साइन इन',
    welcomeBack: 'वापसी पर स्वागत है',
    signInToAccount: 'अपने LocalHub खाते में साइन इन करें',
    dontHaveAccount: 'कोई खाता नहीं है?',
    signUpHere: 'यहां साइन अप करें',
    alreadyHaveAccount: 'पहले से खाता है?',
    signInHere: 'यहां साइन इन करें',
    food: 'भोजन',
    groceries: 'किराना',
    medicine: 'दवा',
    bicycle: 'साइकिल',
    motorcycle: 'मोटरसाइकिल',
    car: 'कार',
    scooter: 'इलेक्ट्रिक स्कूटर',
    customer: 'ग्राहक',
    shopOwner: 'दुकान मालिक',
    deliveryPartner: 'डिलीवरी पार्टनर',
    iAmA: 'मैं हूं'
  }
}

export const useLanguage = () => {
  const [language, setLanguage] = useState('en')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Load user's preferred language
      const loadUserLanguage = async () => {
        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('preferred_language')
            .eq('id', user.id)
            .single()
          
          if (data?.preferred_language) {
            setLanguage(data.preferred_language)
          }
        } catch (error) {
          console.log('Error loading user language:', error)
        }
      }
      loadUserLanguage()
    }
  }, [user])

  const changeLanguage = async (newLanguage: string) => {
    setLanguage(newLanguage)
    if (user) {
      try {
        await supabase
          .from('user_profiles')
          .update({ preferred_language: newLanguage })
          .eq('id', user.id)
      } catch (error) {
        console.log('Error saving language preference:', error)
      }
    }
  }

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key
  }

  return { language, changeLanguage, t }
}
