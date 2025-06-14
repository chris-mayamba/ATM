# ATM Finder Lubumbashi 🏧

**Application mobile professionnelle pour localiser les distributeurs automatiques à Lubumbashi**

Une application React Native moderne développée avec Expo, offrant une expérience utilisateur exceptionnelle pour trouver facilement les distributeurs ATM dans la ville de Lubumbashi, République Démocratique du Congo.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Connexion classique** avec email/mot de passe
- **Authentification Google** pour une connexion rapide
- **Création de compte** avec géolocalisation automatique
- **Gestion sécurisée des sessions** avec Appwrite

### 🗺️ Cartographie & Localisation
- **Carte interactive** avec Google Maps
- **Géolocalisation en temps réel** de l'utilisateur
- **Marqueurs personnalisés** par banque avec couleurs distinctives
- **Calcul d'itinéraires** vers les ATM sélectionnés
- **Estimation du temps de trajet**

### 🏦 Base de données ATM complète
- **15+ distributeurs** répertoriés à Lubumbashi
- **8 banques principales** : Rawbank, Equity Bank, BCDC, TMB, FBN Bank, UBA, Access Bank, Sofibanque
- **Informations détaillées** : adresse, services, horaires, statut
- **Évaluations et commentaires** communautaires

### 🔍 Recherche & Filtres avancés
- **Recherche textuelle** par nom de banque ou ATM
- **Filtres intelligents** : tous, ouverts, proches, par banque
- **Tri par distance** automatique
- **Interface intuitive** avec chips de sélection

### 📱 Interface utilisateur moderne
- **Design professionnel** avec Material Design 3
- **Mode sombre/clair** automatique
- **Animations fluides** avec React Native Reanimated
- **Typographie premium** avec Google Fonts (Inter, Poppins)
- **Composants réutilisables** et modulaires

### 🎯 Fonctionnalités communautaires
- **Signalement de disponibilité** des ATM
- **Système de commentaires** et d'évaluations
- **Partage d'expériences** entre utilisateurs
- **Mise à jour collaborative** des informations

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+
- Expo CLI
- Compte Appwrite (pour l'authentification)
- Clé API Google Maps

### Installation
```bash
# Cloner le projet
git clone https://github.com/votre-repo/atm-finder-lubumbashi.git
cd atm-finder-lubumbashi

# Installer les dépendances
npm install

# Démarrer l'application
npx expo start
```

### Configuration
1. **Appwrite** : Configurez votre projet Appwrite et mettez à jour l'endpoint dans `ctx.tsx`
2. **Google Maps** : Ajoutez votre clé API dans `app.json`
3. **Google Auth** : Configurez l'authentification Google dans Appwrite

## 🏗️ Architecture

### Structure du projet
```
app/
├── (tabs)/           # Navigation par onglets
│   ├── home.tsx      # Écran principal avec carte
│   └── profile.tsx   # Profil utilisateur
├── login.tsx         # Authentification
├── register.tsx      # Création de compte
└── _layout.tsx       # Layout principal

components/
├── InputWithIcon.tsx # Champ de saisie personnalisé
├── WebMap.tsx        # Composant carte web
└── Card.tsx          # Composant carte réutilisable

data/
└── atmData.ts        # Base de données ATM Lubumbashi
```

### Technologies utilisées
- **React Native** avec Expo SDK 53
- **TypeScript** pour la sécurité des types
- **Expo Router** pour la navigation
- **Appwrite** pour l'authentification et la base de données
- **Google Maps** pour la cartographie
- **React Native Reanimated** pour les animations
- **Lucide React Native** pour les icônes
- **Expo Linear Gradient** pour les dégradés

## 🎨 Design System

### Couleurs principales
- **Primary** : #3b82f6 (Bleu)
- **Secondary** : #10b981 (Vert)
- **Accent** : #f59e0b (Orange)
- **Success** : #10b981
- **Warning** : #f59e0b
- **Error** : #ef4444

### Typographie
- **Titres** : Poppins (Bold, SemiBold)
- **Corps de texte** : Inter (Regular, Medium, SemiBold)
- **Tailles** : 12px à 32px avec hiérarchie claire

### Composants
- **Cartes** avec ombres et bordures arrondies
- **Boutons** avec états hover et pressed
- **Inputs** avec icônes et validation
- **Modales** avec animations d'entrée/sortie

## 🏦 Banques supportées

| Banque | Couleur | ATM disponibles |
|--------|---------|-----------------|
| Rawbank | Rouge | 4 distributeurs |
| Equity Bank | Vert | 3 distributeurs |
| BCDC | Bleu | 3 distributeurs |
| TMB | Orange | 2 distributeurs |
| FBN Bank | Violet | 1 distributeur |
| UBA | Orange foncé | 1 distributeur |
| Access Bank | Turquoise | 1 distributeur |
| Sofibanque | Gris foncé | 1 distributeur |

## 📍 Zones couvertes à Lubumbashi

- **Centre-ville** : Avenue Mobutu, Avenue Lumumba
- **Katuba** : Commune résidentielle
- **Kampemba** : Zone commerciale
- **Ruashi** : Quartier universitaire
- **Kenya** : Zone industrielle
- **Annexe** : Quartier administratif
- **Aéroport** : Terminal international
- **Campus universitaire** : UNILU

## 🔧 Développement

### Scripts disponibles
```bash
npm start          # Démarrer Expo
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Lancer sur Web
npm run lint       # Vérifier le code
```

### Contribution
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📱 Captures d'écran

*[Ajoutez ici des captures d'écran de l'application]*

## 🚀 Déploiement

### Build de production
```bash
# Android
npx expo build:android

# iOS
npx expo build:ios

# Web
npx expo export:web
```

### Publication
```bash
# Expo Go
npx expo publish

# App Stores
npx expo upload:android
npx expo upload:ios
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

**Développé par l'équipe ATM Finder :**
- Rooney, Christian, Yves - Développement principal
- Caldie, Glodis, Therese - Design & UX
- Gladis, Pauline, Naomi - Tests & QA
- Guemalie, Ignace, Josue, Hurment - Données & Contenu

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@atmfinder-lubumbashi.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-repo/atm-finder-lubumbashi/issues)
- 💬 Discussions : [GitHub Discussions](https://github.com/votre-repo/atm-finder-lubumbashi/discussions)

---

**ATM Finder Lubumbashi** - Trouvez facilement les distributeurs près de vous ! 🏧✨