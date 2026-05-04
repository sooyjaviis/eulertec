<?php
// Configuración de cabeceras para permitir peticiones desde el frontend (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de peticiones OPTIONS (Pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// Leer los datos recibidos en el cuerpo de la petición
$data = json_decode(file_get_contents("php://input"));

if (!$data || empty($data->usuario) || empty($data->password)) {
    echo json_encode([
        "success" => false, 
        "message" => "Usuario y contraseña son requeridos"
    ]);
    exit;
}

$user = $data->usuario;
$pass = $data->password;

try {
    // Consulta para obtener los datos del usuario y el nombre de su rol
    // Unimos con la tabla roles para tener el nombre descriptivo si lo necesitas
    $sql = "SELECT u.id, u.nombre, u.apellido_paterno, u.rol_id, u.password, r.nombre as nombre_rol 
            FROM usuarios u 
            LEFT JOIN roles r ON u.rol_id = r.id 
            WHERE u.usuario = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Verificación de la contraseña
        // Si en la base de datos están en texto plano usamos la comparación directa
        if ($pass === $row['password']) {
            
            // Generamos un token sencillo para la sesión
            $token = bin2hex(random_bytes(16));
            
            // Enviamos la respuesta con toda la información necesaria para el App.jsx
            echo json_encode([
                "success" => true,
                "id" => (int)$row['id'],
                "nombre" => $row['nombre'] . " " . $row['apellido_paterno'],
                "rol_id" => (int)$row['rol_id'], // Crucial para el switch en React
                "rol_nombre" => $row['nombre_rol'],
                "token" => $token
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "El usuario no existe"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en el servidor: " . $e->getMessage()]);
}

$conn->close();
?>