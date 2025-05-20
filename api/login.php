<?php
header('Content-Type: application/json');

try {
    $mysqli = new mysqli('localhost', 'root', '', 'projet_tutore');
    // Vérifie la connexion
    if ($mysqli->connect_errno) {
        echo json_encode(["success" => false, "message" => "Erreur de connexion à la base de données"]);
        exit();
    }

    // Récupère les données JSON envoyées
    $input = json_decode(file_get_contents('php://input'), true);

    $email = isset($input['email']) ? $input['email'] : '';
    $motdepasse = isset($input['motdepasse']) ? $input['motdepasse'] : '';

    // Vérifie que les champs ne sont pas vides
    if (empty($email) || empty($motdepasse)) {
        echo json_encode(["success" => false, "message" => "Champs manquants"]);
        exit();
    }

    // Prépare la requête pour éviter les injections SQL
    $stmt = $mysqli->prepare("SELECT id, nom, email, motdepasse FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        // Vérifie le mot de passe (ici en clair, adapte si tu utilises password_hash)
        if ($motdepasse === $user['motdepasse']) {
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['id'],
                    "nom" => $user['nom'],
                    "email" => $user['email']
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Mot de passe incorrect"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Utilisateur non trouvé"]);
    }

    $stmt->close();
    $mysqli->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}