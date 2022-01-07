import sqlite3
import threading
from time import sleep
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from concurrent.futures import ThreadPoolExecutor

def get_coors(place):
    driver = webdriver.Firefox()
    driver.get('https://www.google.com/maps')
    # accept cookies
    driver.find_elements_by_css_selector('button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc"]')[-1].click()
    driver.implicitly_wait(10)
    # search place
    searchinput = driver.find_element_by_id('searchboxinput')
    searchinput.send_keys(place)
    driver.find_element_by_id('searchbox-searchbutton').click()
    # get coordenates from the url
    sleep(30)
    coors = driver.current_url.split('@')[1].split(',')
    coors = coors[0] + ', ' + coors[1]
    print(coors)
    # store coordenates
    cur = sqlite3.connect('enoturismo.db').cursor()
    cur.execute('UPDATE sitios SET maps_coors = ? WHERE name = ?;', (coors, place.split(' near ')[0]))
    cur.execute("COMMIT;")
    cur.close()    
    driver.quit()
    

def fix_coors():
    dict = {
    'Cueva del Moro' : '41.556583,-3.394227',
    'La Cocina de Clotilde' : '42.178762,-1.7616039',
    'Las Palmeras' : '42.204696,-1.8645093',
    'Buenos Aires' : '42.4622969,-2.4505706',
    'Doñana' : '42.4610808,-2.4456787',
    'En las Nubes' : '42.4627645,-2.451499',
    'Lorenzo, casa de comidas' : '42.4659877,-2.4518301',
    'Sosua' : '42.4671689,-2.4497723',
    'Pizzería Miami' : '42.4184932,-2.7355331',
    'Sofía' : '42.4181795,-2.7278044',
    'Valparaíso' : '42.332952,-2.0708564',
    'La Roca' : '42.1618315,-2.1159647',
    'El Romeral' : '42.5484201,-2.7863196',
    'Hidalgo' : '42.440471,-2.9559622',
    'Don Pedro' : '42.2955903,-2.5454446',
    'El Refugio since 1993' : '42.2955903,-2.5454446',
    'Iglesia de San Servando y San Germán' : '42.4345555,-2.7129898',
    'Museo al aire libre - Esculturas con sabor a Haro' : '42.5734627,-2.855534',
    'Eurovelo 1. Atlantic Coast Route' : '42.4715939,-2.4321837',
    'Convento de San Francisco' : '42.4389853,-2.9641387',
    'Guía Turístico Loreto Esteban' : '41.671129,-3.687858',
    'Sendero de Ciella' : '41.8599481,-3.5611904',
    'Carabanchel' : '42.4661062,-2.4500267',
    'Ciudad de Madrid' : '42.4544938,-2.4478917',
    'Malvasia' : '42.473241,-2.430919',
    'Pepito' : '42.4643683,-2.460344',
    'Exposición permanente de los Pasos de Semana Santa' : '42.3003061,-1.9607645',
    'Pista de Patinaje sobre Hielo' : '42.4630611,-2.4389659'      
    }

    for p in dict.keys():
        cur = sqlite3.connect('enoturismo.db').cursor()
        cur.execute('UPDATE sitios SET maps_coors = ? WHERE name = ?;', (dict[p], p))
        cur.execute("COMMIT;")
        cur.close()    
    

def main():
    cur = sqlite3.connect('enoturismo.db').cursor()
    cur.execute('SELECT name, destination FROM sitios WHERE maps_coors IS NULL')
    queries = [el[0] + ' near ' + el[1] for el in cur.fetchall()]
    cur.close()
    with ThreadPoolExecutor(max_workers=3) as exe:
        for place in queries:
            exe.submit(get_coors, place)
    fix_coors()

if __name__ == "__main__":
    main()
