@pytest.fixture
def guide_data():
    return {
        "titre_poste": "Developpeur Python Senior",
        "nom_entreprise": "TechCorp",
        "synthese_strategique": {
            "pitch_30s": "Je suis un dev backend avec 8 ans d experience.",
            "trois_forces_a_valoriser": ["Expertise Python", "Leadership", "Delivery"],
            "trois_faiblesses_a_gerer": [
                {"faiblesse": "Perfectionnisme", "parade": "Je priorise avec impact business"},
            ],
        },
        "checklist_preparation": {
            "logistique": ["Tester la visio", "3 copies du CV"],
            "recherche_entreprise": ["Actualites recentes", "Concurrents"],
        },
        "defis_cles_entreprise": ["Refonte microservices", "Scalabilite 10x"],
        "phases_entretien": [
            {
                "phase_numero": 2,
                "phase_nom": "Introduction",
                "duree_estimee": "5 min",
                "objectif_recruteur": "Verifier votre aisance",
                "questions_probables": [
                    {
                        "question": "Parlez-moi de vous",
                        "intention_recruteur": "Tester la synthese",
                        "strategie_reponse": "Methode Passe/Present/Futur",
                        "exemple_reponse_cadre": "Je suis developpeur avec 8 ans d experience...",
                    },
                ],
            },
        ],
        "questions_piege_et_pression": [
            {
                "question": "Quelle est votre faiblesse ?",
                "ce_quil_cherche_vraiment": "Lucidite",
                "parade_tactique": "Choisir une faiblesse non bloquante",
                "exemple_reponse_cadre": "Le perfectionnisme...",
            },
        ],
        "questions_a_poser_par_interlocuteur": {
            "rh": ["Culture d entreprise ?"],
            "manager_technique": ["Defis techniques ?"],
            "dirigeant": ["Vision a 3 ans ?"],
        },
        "cloture_et_negociation": {
            "strategie_salariale": "Donner une fourchette basee sur le marche",
            "reponse_quand_commencer": "Preavis de 2 mois",
            "erreurs_a_eviter": ["Ne pas critiquer ses anciens employeurs"],
            "question_de_cloture": "Y a-t-il un point a approfondir ?",
        },
    }