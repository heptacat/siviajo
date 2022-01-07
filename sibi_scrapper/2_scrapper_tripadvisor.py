import requests
import csv
from bs4 import BeautifulSoup
import sqlite3
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import warnings
from deep_translator import GoogleTranslator
from textblob import TextBlob

warnings.filterwarnings("ignore")

baseurl = 'https://www.tripadvisor.es/Search?q='
cur = sqlite3.connect('enoturismo.db').cursor()
  
def db_store_review(place_name, author, rate, review, sentiment, n_reviews):
    print('Saving the comment from ' + author)
    cur.execute('INSERT OR IGNORE INTO reviews (place, author, rate, review, positivity) values (?, ?, ?, ?, ?);',
                (place_name, author, rate, review, sentiment))
    cur.execute("COMMIT;")
    cur.execute('UPDATE sitios SET n_reviews = ? WHERE name = ?;', (n_reviews, place_name))
    cur.execute("COMMIT;")

def sentiment_analysis(review):
    translated = GoogleTranslator(source='auto', target='en').translate(text=review)
    polarity = TextBlob(translated).sentiment.polarity
    return polarity
    
def scrap_result(name, driver):
    driver.switch_to.window(driver.window_handles[1])
    driver.implicitly_wait(10)
    sleep(3)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    # number of reviews
    n_reviews = int(driver.find_element_by_css_selector("span[class='WlYyy diXIH bGusc dDKKM']").text)
    print(n_reviews, 'reviews')
    print('Retrieving reviews...')
    # this part of the css changes quite often
    reviews = driver.find_elements_by_css_selector('.dHjBB > div')[:-1]
    if len(reviews) == 0:
        reviews = driver.find_elements_by_css_selector('.ebHXW > div')[:-1]
        if len(reviews) == 0:
            reviews = driver.find_elements_by_css_selector('.bPhtn > div')[:-1]
   
    for review in reviews:
        reviewer_name = review.find_element_by_css_selector("span[class='WlYyy cPsXC dTqpp']").text
        review_title = review.find_element_by_css_selector('div[class="WlYyy cPsXC bLFSo cspKb dTqpp"]').text
        review_text = review.find_element_by_css_selector('div[class="WlYyy diXIH dDKKM"]').text
        rating = review.find_element_by_css_selector('svg[class="RWYkj d H0"]').get_attribute("title")[0]
        sentiment = sentiment_analysis(review_text)
        print ('Username: {}\nTitle: {}\nReview: {}\nRating: {}\n\n'.format(reviewer_name, review_title, review_text, rating))
        db_store_review(name, reviewer_name, rating, review_title+'\n'+review_text, sentiment, n_reviews)
    driver.quit()
    

def pick_result(place, driver):    
    driver.get(baseurl + place)
    driver.implicitly_wait(10)
    driver.find_element_by_id('onetrust-accept-btn-handler').click()
    sleep(1)
    driver.find_element_by_class_name('result').click()
    scrap_result(place, driver)

def places_csv(f):
    places = set()
    with open (f, mode='r') as file:
        csv_file = csv.reader(file)
        next(csv_file)
        for row in csv_file:
            places.add(row[0])
    return places            
        

def main():
    cur.execute('CREATE TABLE IF NOT EXISTS reviews (id integer primary key autoincrement, place text, author text, rate integer, review text, positivity real);')
    cur.execute('SELECT place FROM reviews GROUP BY place')
    scrapped_places = [el[0] for el in cur.fetchall()]
    places = places_csv('bodegasvinos.csv')
    for place in places:
        if place not in scrapped_places:
            print('Scrapping ', place)
            driver = webdriver.Firefox()
            try:
                pick_result(place, driver)
            except:
                pass    

if __name__ == "__main__":
    main()