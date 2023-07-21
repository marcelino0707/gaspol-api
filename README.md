# Kebutuhan
1. MySQL minimal version 8 yak
# Cara install
1. Install NPM dulu
2. Jalankan `npm install` di terminal

# Setup environment
1. Bikin file dengan nama `.env`
2. Copy semua isi file yang berada di `.env-example` terus paste ke file `.env`

# Migration
## create migration
`npx sequelize-cli migration:generate --name create_name_table`
## run migration
`npx sequelize-cli db:migrate`
## update migration (recreate tables)
`npx sequelize-cli db:migrate:undo:all`

# Seeder
## create seeder
`npx sequelize-cli seed:generate --name table-name`
## run seeder
`npx sequelize-cli db:seed:all`