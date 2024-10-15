const fs = require('fs');
const path = require('path');
const axios = require('axios');
let config;
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
    console.log('Configuration chargée :', config);
} catch (error) {
    console.error('Erreur lors du chargement de la configuration :', error);
}

function fetchUserData(connectCode) {
    console.log('Tentative de récupération des données pour :', connectCode);
    const query = `
        query GetUserData($code: String!) {
            getConnectCode(code: $code) {
                user {
                    displayName
                    rankedNetplayProfile {
                        ratingOrdinal
                        wins
                        losses
                        continent
                    }
                }
            }
        }
    `;

    fetch('https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: { code: connectCode }
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Données reçues :', JSON.stringify(data, null, 2));
        if (data.data && data.data.getConnectCode && data.data.getConnectCode.user) {
            const user = data.data.getConnectCode.user;
            const profile = user.rankedNetplayProfile;
            document.getElementById('displayName').innerText = user.displayName;
            document.getElementById('eloRating').innerText = profile.ratingOrdinal.toFixed(2);
            document.getElementById('wins').innerText = profile.wins || '0';
            document.getElementById('losses').innerText = profile.losses || '0';
            
            // Calcul du ratio KDA
            const kda = profile.losses > 0 ? (profile.wins / profile.losses).toFixed(2) : profile.wins;
            document.getElementById('kda').innerText = kda;
            
            document.getElementById('region').innerText = profile.continent || 'N/A';
            document.getElementById('result').innerText = JSON.stringify(data, null, 2);
        } else {
            console.error('Données invalides reçues :', JSON.stringify(data, null, 2));
            document.getElementById('result').innerText = 'Données invalides reçues. Vérifiez la console pour plus de détails.';
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        document.getElementById('result').innerText = 'Erreur lors de la récupération des données';
    });
}

function startAutoRefresh(connectCode) {
    fetchUserData(connectCode);
    setInterval(() => {
        fetchUserData(connectCode);
    }, 30000); 
}

document.addEventListener('DOMContentLoaded', async () => {
    if (config && config.username) {
        startAutoRefresh(config.username);
    } else {
        console.error('Nom d\'utilisateur non trouvé dans la configuration');
        document.getElementById('result').innerText = 'Erreur de configuration';
    }

    try {
        const response = await axios.get('https://slippi.gg/static/media/');
        const data = response.data;
        console.log('Statistiques média :');
        data.forEach(file => {
            console.log({
                scheme: 'https',
                host: 'slippi.gg',
                filename: `/static/media/${file.name}`,
                taille: `${file.size} octets`,
                dateDeModification: new Date(file.lastModified).toISOString()
            });
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers média:", error);
    }

    console.log('Statistiques média :');
    console.log({
        scheme: 'https',
        host: 'slippi.gg',
        filename: '/static/media/rank_Bronze_III.*.svg'
    });
});

document.getElementById('fetchButton').addEventListener('click', () => {
    const connectCode = document.getElementById('connectCodeInput').value;
    const query = `
        query GetUserData($code: String!) {
            getConnectCode(code: $code) {
                user {
                    displayName
                    rankedNetplayProfile {
                        ratingOrdinal
                        wins
                        losses
                    }
                }
            }
        }
    `;

    fetch('https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: { code: connectCode }
        })
    })
    .then(response => response.json())
    .then(data => {
        const user = data.data.getConnectCode.user;
        const profile = user.rankedNetplayProfile;
        
        document.getElementById('eloRating').innerText = profile.ratingOrdinal.toFixed(2);
        document.getElementById('wins').innerText = profile.wins || 'N/A';
        document.getElementById('losses').innerText = profile.losses || 'N/A';
        
        document.getElementById('result').innerText = JSON.stringify(data, null, 2);
    })
    .catch(error => {
        console.error('Erreur:', error);
        document.getElementById('result').innerText = 'Erreur lors de la récupération des données';
    });
});
