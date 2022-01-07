from neo4j import GraphDatabase
import sqlite3
import csv


uri = "neo4j://localhost:7687"
auth_login = 'neo4j'  # tourism
auth_pass = 'p'

driver = GraphDatabase.driver(uri, auth=(auth_login, auth_pass))
bodegas_en_csv = set()
wines = list()


def create_destination(tx, name):
    tx.run("MERGE (:Destination {name: $name})",
           name=name)


def create_wine(tx, do, type, name):
    tx.run("MERGE (:Wine {name: $name, type: $type, do: $do})",
           do=do, type=type, name=name)


def create_place(tx, destination, category, name, logoUrl, photoUrl, description, contact, website, additionalInfo, mapsCoors, schedule, nReviews):
    print(name)
    # CamelCase category
    category = category.split('-')
    for i in range(len(category)):
        category[i] = category[i][0].upper() + category[i][1:]
    category = "".join(category)    
    
    if nReviews is None:
        nReviews = 0
    query = """
       MATCH (d:Destination{name: $destination})
       MERGE (a:Place {
       name: $name,
       logoUrl : $logoUrl,
       photoUrl : $photoUrl,
       description : $description,
       contact : $contact,
       website : $website,
       additionalInfo : $additionalInfo,
       mapsCoors : $mapsCoors,
       schedule : $schedule,
       nReviews : $nReviews
        })-[:IS_IN]->(d)
        SET a:"""+category
    if category == 'Bodegas' and name in bodegas_en_csv:  # todo get data
        for wine in wines:
            if wine[0] == name:
                if wine[1] is not None: # do
                    #todo comillas
                    query = query + " MERGE (a)-[:SELLS]->(:Wine{name: '"+wine[3] + "', do: '"+wine[1]+"', type: '"+wine[2]+"'}) "
                else:    
                    query = query + " MERGE (a)-[:SELLS]->(:Wine{name: '"+wine[3] + "', type: '"+wine[2]+"'}) "
    tx.run(query,
           destination=destination, name=name, logoUrl=logoUrl, photoUrl=photoUrl, description=description, contact=contact, website=website, additionalInfo=additionalInfo, mapsCoors=mapsCoors, schedule=schedule, nReviews=nReviews)


def create_review(tx, place, author, rate, review, positivity):
    tx.run("""MATCH (p:Place {name : $place})
           MERGE (r:Review {author: $author, rate: $rate, review: $review, positivity: $positivity})-[:REVIEWS]->(p)""",
           place=place, author=author, rate=rate, review=review, positivity=positivity)

def create_user_constraint():
    tx.run("CREATE CONSTRAINT UniqueUserUsernameConstraint ON (u:User) ASSERT u.username IS UNIQUE")
    tx.run("CREATE CONSTRAINT UniqueUserEmailConstraint ON (u:User) ASSERT u.email IS UNIQUE")

def create_routes():
    tx.run('''
        MATCH (d:Destination{name: 'La Rioja'})
        MERGE(d)<-[:IS_IN]-(r:Route)
        SET r.name = "El camino del vino"
        SET r.placeNames = ["Ollauri", "Briones", "San Asensio", "Haro"]
        SET r.claceCoors = ["42.5425748,-2.8372823", "42.5437151,-2.7866505", "42.5029223,-2.7512539", "42.5722952,-2.8633881"]
        ''')
    tx.run('''
        MATCH (d:Destination{name: 'Ribera del duero'})
        MERGE(d)<-[:IS_IN]-(r:Route)
        SET r.name = "Ruta del vino por Ribera"
        SET r.placeNames = ["El Burgo de Osma", "Aranda de Duero", "Peñafiel", "camino a Valladolid", "Valladolid" ]
        SET r.claceCoors = ["41.5866923,-3.0720475", "41.670097,-3.7058201", "41.5975095,-4.1288631", "41.638978,-4.1259387", "41.6523098,-4.7595515"]
        ''')

def main():
    cur = sqlite3.connect('enoturismo.db').cursor()
    load_places_csv('bodegasvinos.csv')
    
    # destinations
    cur.execute('SELECT destination FROM sitios GROUP BY destination;')
    destinations = [el[0] for el in cur.fetchall()]
    with driver.session() as session:
        for destination in destinations:
            session.write_transaction(create_destination, destination)

    # places
    cur.execute('SELECT destination, category_name, name, logo_url, photo_url, description, contact, website, additional_info, maps_coors, schedule, n_reviews FROM sitios;')
    places = cur.fetchall()
    with driver.session() as session:
        for place in places:
            place = list(place)
            for i in range(len(place)):
                if place[i] is None:
                    place[i] = ''
            session.write_transaction(create_place, place[0], place[1], place[2], place[3],
                                      place[4], place[5], place[6], place[7], place[8], place[9], place[10], place[11])

    # reviews
    cur.execute('SELECT place, author, rate, review, positivity FROM reviews;')
    reviews = cur.fetchall()
    with driver.session() as session:
        for review in reviews:
            session.write_transaction(create_review, review[0], review[1], review[2], review[3], review[4])
    create_user_constraint()
    create_routes()

def load_places_csv(f):
    with open(f, mode='r') as file:
        csv_file = csv.reader(file)
        next(csv_file)
        for row in csv_file:
            bodegas_en_csv.add(row[0])
            wines.append(row)
    return bodegas_en_csv, wines


if __name__ == "__main__":
    main()
    driver.close()

