import requests
from bs4 import BeautifulSoup
import sqlite3


cur = sqlite3.connect('enoturismo.db').cursor()

def request(url):
    response = requests.get(url)
    if response.status_code != 200:
        print('Error conectando con', url)
        exit()
    else:
        return BeautifulSoup(response.content, "html.parser")

def db_store_place(category_name, name, logo_url, photo_url, description, contact, website, additional_info, maps_coors, schedule):
    print ('Insertando', category_name, name)
    print(type(logo_url))
    print(type(photo_url))
    cur.execute('INSERT OR IGNORE INTO sitios (destination, category_name, name, logo_url, photo_url, description, contact, website, additional_info, schedule) values ("La Rioja", ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                (category_name, name, logo_url, photo_url, description, contact, website, additional_info, schedule))
    cur.execute("COMMIT;")

def scrap_place(category_name, url):
    print(url)
    soup = request(url)    
    name = soup.find(class_='edit_name')
    if name is not None:
        name = name.get_text().strip()
    else:
        pass
    logo_url = 'https://content.gnoss.ws/lrt/imagenes/proyectos/76b7a706-3906-4522-a8c5-ab1aefe01563.png?v=3'
    photo_url = None
    description = None
    maps_coors = None
    website = None
    additional_info = None
    schedule = None
    contact = ''
    
    try:
        photo_url = soup.find('div',{"class":"edit_image"}).find('img')['src']
    except:
        pass
    try:
        description = soup.find(class_='group_general').get_text().strip()
    except:
        pass
    try:
        website = soup.find(class_='edit_url').find(class_='value').get_text().strip()
    except:
        pass
    try:
        additional_info = soup.find_all('div',{"class":"group_general"})[1].find(class_='value').get_text().replace('TIPOS DE VISITA', '')
    except: # there is not additional info
        pass
    try:
        contact =  contact + soup.find(class_='edit_streetAddress').find(class_='value').get_text().strip()
    except: # there is not an address
        pass
    try:
        contact = contact + soup.find(class_='edit_telephone').find(class_='value').get_text().strip()
    except: # there is not a phone number
        pass
    try:
        contact = contact + soup.find(class_='edit_email').find(class_='value').get_text().strip()
    except: # there is not an email
        pass
    try:
        schedule = soup.find(class_='edit_hasOpenHours').find(class_='value').get_text().strip()
    except:
        pass
       
    db_store_place(category_name, name, logo_url, photo_url, description, contact, website, additional_info, maps_coors, schedule)
    
    
def scrap_category(category_name, url, page_number=1):
    print(url+'&pagina='+ str(page_number))
    print('-\n--\n--')
    page = request(url + '&pagina=' + str(page_number))
    url_places = page.find_all(class_='title')
    url_places = [i.find('a')['href'] for i in url_places]
    for place_url in url_places:
        scrap_place(category_name, place_url)    
    next = page.find(class_='ultimaPagina')
    if len(url_places) > 0:
        scrap_category(category_name, url, page_number+1)
    
    
def main():
    cur.execute('CREATE TABLE IF NOT EXISTS sitios (id integer primary key autoincrement, destination text, category_name text, name text, logo_url text, photo_url text, description text, contact text, website text, additional_info text, maps_coors text, schedule text);')
    categories =	{
        "bodegas": "https://lariojaturismo.com/metabusqueda?default;rdf:type=winery",
        "alojamientos": "https://lariojaturismo.com/metabusqueda?search=%22alojamientos%20del%20vino%22&pagina=1",
        "restaurantes": "https://lariojaturismo.com/comer-y-beber?default;rdf:type=gastro&rdf:type=gastro",
        "enotecas-y-tiendas": "https://lariojaturismo.com/metabusqueda?search=tienda",
        "ocio": "https://lariojaturismo.com/metabusqueda?search=ocio",
        "agencias-de-viaje": "https://lariojaturismo.com/servicios-turisticos?default;rdf:type=touristservice&touristservice;eharmonise:serviceType@@@multiLan:textValue=agencias%20de%20viaje@es",
        "servicios-turisticos": "https://lariojaturismo.com/servicios-turisticos?default;rdf:type=touristservice&touristservice;eharmonise:serviceType@@@multiLan:textValue=oficina%20de%20turismo@es&",
        "monumentos": "https://lariojaturismo.com/ver-y-hacer?default;rdf:type=attraction",
        "museos-y-centros-de-interpretacion": "https://lariojaturismo.com/metabusqueda?default;rdf:type=attraction&searchLRT=museo&events;onTour:hasTime=20211213-",
        "naturaleza": "https://lariojaturismo.com/ver-y-hacer?default;rdf:type=attraction&attraction;eharmonise:attractionTypePath@@@eharmonise:attractionTypeNode=http://lariojaturismo.gnoss.com/items/attractiontype_00400"
    }
    
    for category in categories:
        scrap_category(category, categories[category])    
        
if __name__ == "__main__":
    main()


