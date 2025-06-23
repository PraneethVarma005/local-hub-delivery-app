
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
    inventory: 'Inventory'
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
    inventory: 'Inventario'
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
    inventory: 'Inventaire'
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
    inventory: 'इन्वेंटरी'
  }
}

export const useLanguage = () => {
  const [language, setLanguage] = useState('en')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Load user's preferred language
      const loadUserLanguage = async () => {
        const { data } = await supabase
          .from('user_profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .single()
        
        if (data?.preferred_language) {
          setLanguage(data.preferred_language)
        }
      }
      loadUserLanguage()
    }
  }, [user])

  const changeLanguage = async (newLanguage: string) => {
    setLanguage(newLanguage)
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ preferred_language: newLanguage })
        .eq('id', user.id)
    }
  }

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key
  }

  return { language, changeLanguage, t }
}
