## starting state
idx | key
 0  | B
 1  | C
 2  | F

### insert head
insert A
 0  | B > A | true
result is index 0
splice at index 0

### insert mid
insert D
 0  | B > D | false
 1  | C > D | false
 2  | F > D | true
result is index 2
splice at index 2

### insert tail
insert H
 0  | B > H | false
 1  | C > H | false
 2  | F > H | false
result is index -1
push on end
