# Configuración de Deployment con GitHub Actions

## Descripción

Este proyecto utiliza GitHub Actions para automatizar el deployment a servidores EC2 usando Docker. El workflow se ejecuta automáticamente cuando se hacen push a las ramas `develop` (entorno de pruebas) y `master` (entorno de producción).

## Secrets Requeridos

Para que el deployment funcione correctamente, necesitas configurar los siguientes secrets en tu repositorio de GitHub:

### Acceso SSH

- `EC2_SSH_KEY`: Clave privada SSH para acceder a los servidores EC2 (formato PEM)
- `EC2_USER`: Usuario para conectarse al servidor (ej: `ubuntu`, `ec2-user`)

### Servidores

- `EC2_HOST_TEST`: Dirección IP o hostname del servidor de pruebas
- `EC2_HOST_PROD`: Dirección IP o hostname del servidor de producción

### Puertos (Opcionales)

- `TEST_PORT`: Puerto donde se ejecutará la aplicación en el servidor de pruebas (por defecto: 3001)
- `PROD_PORT`: Puerto donde se ejecutará la aplicación en el servidor de producción (por defecto: 3000)

## Cómo configurar los Secrets

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret**
4. Agrega cada uno de los secrets mencionados arriba

## Flujo de Deployment

### Rama `develop` → Servidor de Pruebas

- Se ejecuta automáticamente cuando se hace push a la rama `develop`
- Despliega en el servidor de pruebas usando el puerto configurado en `TEST_PORT`
- El contenedor se llama `geminislabs-web`

### Rama `master` → Servidor de Producción

- Se ejecuta automáticamente cuando se hace push a la rama `master`
- Despliega en el servidor de producción usando el puerto configurado en `PROD_PORT`
- El contenedor se llama `tracker-web-prod`

## Preparación del Servidor EC2

Asegúrate de que tus servidores EC2 tengan Docker instalado:

```bash
# Instalar Docker en Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Instalar Docker en Amazon Linux
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -aG docker ec2-user
```

## Estructura del Workflow

1. **build-and-test**: Ejecuta tests, linting y construye la aplicación
2. **deploy-to-ec2-test**: Despliega a pruebas (solo rama develop)
3. **deploy-to-ec2-production**: Despliega a producción (solo rama master)

## Troubleshooting

### Error de conexión SSH

- Verifica que la clave SSH sea correcta y tenga los permisos adecuados
- Asegúrate de que el usuario tenga acceso SSH al servidor
- Verifica que los security groups permitan conexiones SSH (puerto 22)

### Error de Docker

- Verifica que Docker esté instalado y ejecutándose en el servidor
- Asegúrate de que el usuario tenga permisos para ejecutar comandos Docker

### Puerto ocupado

- Verifica que los puertos configurados no estén siendo utilizados por otros servicios
- Puedes cambiar los puertos usando las variables `TEST_PORT` y `PROD_PORT`
