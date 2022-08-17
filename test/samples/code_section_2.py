#!/usr/bin/env python

# BEGIN FRAGMENT: PythonStyleFragmentA
def main():
    print("A normal Pythonic fragment")
# END FRAGMENT

class Complex:
    def __init__(self, realpart, imagpart):
        # BEGIN FRAGMENT: PythonStyleFragmentB
        self.a = 0
        self.b = 1
        # END FRAGMENT

if __name__ == '__main__':
    main()
