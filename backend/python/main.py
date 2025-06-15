from selenium import webdriver
from selenium.webdriver.common.by import By

import time
import meet

options = webdriver.ChromeOptions()
options.add_argument("--disable-infobars")
options.add_argument("--start-maximized")
#options.add_argument("--disable-dev-shm-usage")
#options.add_argument("--no-sandbox")
options.add_argument("--disable-blink-features=AutomationControlled")


options.add_argument("--use-fake-ui-for-media-stream")


options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)

driver = webdriver.Chrome(options=options)

driver.get("https://meet.google.com/oyo-sjjp-fdc")

time.sleep(1)
name = driver.find_element(By.CLASS_NAME, "qdOxv-fmcmS-wGMbrd").send_keys("Innov8r Bot")
time.sleep(1)
speaker = driver.find_elements(By.CLASS_NAME, "VfPpkd-vQzf8d")
speaker[1].click()
vb_cable = driver.find_elements(By.CLASS_NAME, "VfPpkd-qPzbhe-JNdkSc")
lis = vb_cable[1].find_elements(By.TAG_NAME, "li")

time.sleep(1)
lis[2].click()
time.sleep(1)
devices = driver.find_elements(By.CLASS_NAME, "GKGgdd")

devices[0].click()
time.sleep(0.5)
devices[1].click()
time.sleep(1)
driver.find_element(By.CLASS_NAME, "XCoPyb").click()
#time.sleep(5)

meet.main()

driver.quit()
driver.close()