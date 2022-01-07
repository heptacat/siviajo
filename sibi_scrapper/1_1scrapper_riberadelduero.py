import requests
from bs4 import BeautifulSoup
import sqlite3

mainpage = 'https://www.rutadelvinoriberadelduero.es'
cur = sqlite3.connect('enoturismo.db').cursor()

def request(url):
    response = requests.get(url)
    if response.status_code != 200:
        print('Error conectando con', url)
        exit()
    else:
        return BeautifulSoup(response.content, "html.parser")
    
def get_categories(url):
    soup = request(url)
    cat_list = soup.find(class_ = "menu-mlid-766").find_all("li")
    return [i.find('a')['href'] for i in cat_list]

def db_store_place(category_name, name, logo_url, photo_url, description, contact, website, additional_info, maps_coors, schedule):
    print ('Insertando', category_name, name)
    cur.execute('INSERT OR IGNORE INTO sitios (destination, category_name, name, logo_url, photo_url, description, contact, website, additional_info, maps_coors, schedule) values ("Ribera del duero", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                (category_name, name, logo_url, photo_url, description, contact, website, additional_info, maps_coors, schedule))
    cur.execute("COMMIT;")

def scrap_place(category_name, url):
    soup = request(url)    
    name = soup.find(class_='ds-titulo-tipo').get_text().strip()
    print(name)
    logo_url = soup.find(class_='field-name-field-logotipo').find('img')['src']
    photo_url = soup.find(class_='field-name-field-imagen-principal').find('img')['src']
    description = soup.find(class_='ds-descripcion').get_text().strip()
    contact = None
    maps_coors = None
    website = None
    additional_info = None
    schedule = None
    try:
        contact = soup.find(class_='field-name-field-contacto').find_all('div')[1].get_text().strip()
    except: # there is not a contaact section
        pass
    try:
        maps_coors = soup.find(class_='field-name-field-insertar-mapa').find('iframe')['src']
    except: # there is not an embed map
        pass
    try:
        website = soup.find(class_='field-name-field-contacto').find_all('div')[1].find_all('a')[1]['href']
    except: # there is not a second <a> tag in the contact section
        pass
    try:
        additional_info = soup.find(class_='ds-txtdestacado').get_text().strip()
    except: # there is no additional info
        pass
    try:
        schedule = soup.find(class_='field-name-field-horarios').get_text().strip()
    except: # there is no schedule info
        pass    
    
    db_store_place(category_name, name, logo_url, photo_url, description, contact, website, additional_info, maps_coors, schedule)
    
    
def scrap_category(category_name, url):
    print(url)
    url_places = request(url).find(class_='view-content').find_all(class_='imagen_recurso_listado')
    url_places = [i.find('a')['href'] for i in url_places]
    for place in url_places:
        scrap_place(category_name, mainpage + place)
    
    
def main():
    cur.execute('CREATE TABLE IF NOT EXISTS sitios (id integer primary key autoincrement, destination text, category_name text, name text, logo_url text, photo_url text, description text, contact text, website text, additional_info text, maps_coors text, schedule text, n_reviews integer);')

    categories = get_categories(mainpage)
    for category in categories:
        category_name = category.split('/')[-1]
        scrap_category(category_name, mainpage + category)    
        
if __name__ == "__main__":
    main()
