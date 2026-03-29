# This code generates random Yautja names based on the Yautja alphabet and phonetic rules. 
# It generates 5 names per run, then prints them to the console. Program cycles until the user decides to stop it.

import random

# Yautja alphabet and phonetic rules

Yautja_consonants = ['k', 'g', 'q', 'tl', 'r', 'rr', 'hrr', 's', 'z', 't', 'd', 'tj', 'shj', 'dl', 'x'
                     'ts', 'h', 'hl', 'n', 'ng', 'sh', 'ch', 'j', 'jl', 'l', 'w', 'y', 'cht', 'dj', 'sr', 'srr',
                     'ky', 'gy', 'qy', 'tly', 'ry', 'rry', 'hyrr', 'hy', 'hly', 'ny', 'ngy', 'ly', 'kw', 'gw', 'qw', 
                     'tlw', 'rw', 'rrw', 'hwrr', 'sw', 'zw', 'tw', 'tsw', 'tjw', 'dw', 'tjw', 'shjw', 'dlw',
                     'hw', 'hlw', 'nw', 'ngw', 'shw', 'chw', 'jw', 'jlw', 'lw', 'yw', 'chtw', 'djw']

Yautja_vowels = ['a', 'e', 'i', 'o', 'u', 'y']

def generate_yautja_name():
    name_length = random.randint(1, 3)  # Yautja names typically have 1-3 syllables
    name = ''
    glottal_stops = 0
    
    for _ in range(name_length):
        consonant = random.choice(Yautja_consonants)
        vowel = random.choice(Yautja_vowels)
        # Sometimes, names have ' within to indicate a glottal stop, so we can randomly add it
        if random.random() < 0.3 and glottal_stops < 2:  # 30% chance to add a glottal stop, max 2 per name
            name += consonant + "'" + vowel
            glottal_stops += 1
        else:
            name += consonant + vowel
    
    return name.capitalize()  # Capitalize the first letter of the name

def main():
    while True:
        print("Generated Yautja Names:")
        for _ in range(5):
            print(generate_yautja_name())
        print()  # Print a blank line for better readability
        cont = input("Generate more names? (y/n): ")
        if cont.lower() != 'y':
            break
        # If user doesn't want to continue, print a message before exiting
    print("If you'd like to translate your name to Yautja symbols, you can use the Yautja Translator tool available online.")
    # Provide the link to the Yautja Translator tool
    print("Yautja Translator: https://www.avpcentral.com/yautja-language-translator")
if __name__ == "__main__":
    main()
    
