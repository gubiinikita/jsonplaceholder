///<reference types = "cypress"/>
import postsContent from "../support/posts_content.json"
import {faker} from '@faker-js/faker';
import post from '../fixtures/post.json';
import user from '../fixtures/user.json';

user.email = faker.internet.email();
user.password = faker.internet.password(15);
post.title = faker.hacker.abbreviation();
post.body = faker.hacker.phrase();

let token
let postId

describe('Request exam task', () => {
  it(`Registration`, () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/register',
      body:
      {
        "email": user.email, 
        "password": user.password
      },
    }).then(response => {
      token = 'Bearer ' + response.body.accessToken
      expect(response.status).to.be.eq(201);
      console.log(token)
    })
  })

  it(`Get all posts`, () => {
    cy.request('GET', 'http://localhost:3000/posts').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.headers).to.have.property('content-type', 'application/json; charset=utf-8')
    })
  })

  it(`Get first 10 posts`, () => {
    cy.request('GET', 'http://localhost:3000/posts?_start=0&_end=10').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.body).to.deep.equal(postsContent)
    })
  })

  it(`Get posts with ID's 55 and 60`, () => {
    cy.request('GET', 'http://localhost:3000/posts?id=60&id=55').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.body[0].id).to.be.eq(55);
      expect(response.body[1].id).to.be.eq(60);
    })
  })

  it(`Create new post without auth but with auth route`, () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/664/posts',
      body:
      {
        title: post.title,
        body: post.body
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(401);
    })
  })

  it(`Create new post with auth`, () => {
    cy.request({
      headers:
      {
        'Authorization': token
      },
      method: 'POST',
      url: 'http://localhost:3000/664/posts',
      body:
      {
        title: post.title,
        body: post.body
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq(post.title);
      expect(response.body.body).to.be.eq(post.body);
      postId = response.body.id;
    }).then(() => {
      cy.request({
        headers:
        {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        url: `http://localhost:3000/posts/${postId}`
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq(expetedTitle);
        expect(response.body.body).to.be.eq(expectedBody);
      })
    })
  })

  it(`Create new post without auth`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: 'http://localhost:3000/posts',
      body:
      {
        title: "111",
        body: "1111"
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq('111');
      expect(response.body.body).to.be.eq('1111');
    }).then(() => {
      cy.request({
        headers:
        {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        url: `http://localhost:3000/posts/${postId}`
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq('111');
        expect(response.body.body).to.be.eq('1111');
      })
    })
  })

  it(`Update non-existing post`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'PATCH',
      url: 'http://localhost:3000/posts/128323',
      body:
      {
        title: "111",
        body: "1111"
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(404);
    })
  })

  it(`Create new post and update it`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: 'http://localhost:3000/posts',
      body:
      {
        title: "111",
        body: "1111"
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq('111');
      expect(response.body.body).to.be.eq('1111');
      postId = response.body.id
    }).then(() => {
      cy.request({
        headers:
        {
          'Content-Type': 'application/json'
        },
        method: 'PATCH',
        url: `http://localhost:3000/posts/${postId}`,
        body:
        {
          title: "updated post",
          body: "updated post"
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq('updated post');
        expect(response.body.body).to.be.eq('updated post');
      }).then(() => {
        cy.request({
          headers:
          {
            'Content-Type': 'application/json'
          },
          method: 'GET',
          url: `http://localhost:3000/posts/${postId}`
        }).then(response => {
          expect(response.status).to.be.eq(200);
          expect(response.body.title).to.be.eq('updated post');
          expect(response.body.body).to.be.eq('updated post');
        })
      })
    })
  })

  it(`Delete non-existing post`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      url: 'http://localhost:3000/posts/128323',
      body:
      {
        title: "111",
        body: "1111"
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(404);
    })
  })

  it(`Create new post and update it and then delete it`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: 'http://localhost:3000/posts',
      body:
      {
        title: "111",
        body: "1111"
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq('111');
      expect(response.body.body).to.be.eq('1111');
      postId = response.body.id
    }).then(() => {
      cy.request({
        headers:
        {
          'Content-Type': 'application/json'
        },
        method: 'PATCH',
        url: `http://localhost:3000/posts/${postId}`,
        body:
        {
          title: "updated post",
          body: "updated post"
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq('updated post');
        expect(response.body.body).to.be.eq('updated post');
      }).then(() => {
        cy.request({
          headers:
          {
            'Content-Type': 'application/json'
          },
          method: 'DELETE',
          url: `http://localhost:3000/posts/${postId}`
        }).then(response => {
          expect(response.status).to.be.eq(200);
        }).then(() => {
          cy.request({
            headers:
            {
              'Content-Type': 'application/json'
            },
            method: 'GET',
            url: `http://localhost:3000/posts/${postId}`,
            failOnStatusCode: false
          }).then(response => {
            expect(response.status).to.be.eq(404);
          })
        })
      })
    })
  })
})