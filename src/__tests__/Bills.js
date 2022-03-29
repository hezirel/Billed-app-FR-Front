/**
 * @jest-environment jsdom
 */

import {
  screen,
  waitFor
} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import Bills from '../containers/Bills.js'
import BillsUI from '../views/BillsUI.js'
import {
  localStorageMock
} from '../__mocks__/localStorage.js'
import {
  ROUTES,
  ROUTES_PATH
} from '../constants/routes'
import mockStore from '../__mocks__/store.js'
import {
  bills
} from '../fixtures/bills'
import router from '../app/Router'

jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee and I am on Bills page', () => {
  describe('when I click  on the new bill button', () => {
    test('I should be sent to the new bill page', () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({
        data: bills
      })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      const store = null
      //Bootsrap mock to call the modal method of the handleClickIconEye function
      $.fn.modal = jest.fn()
      const billsView = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      //   const handleClickIconEye = jest.spyOn(billsView, 'handleClickIconEye')
      const handleClickNewBill = jest.fn(billsView.handleClickNewBill)
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickNewBill())
      userEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
  describe('When I click on the icon eye icon', () => {
    test('A modal should open', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({
        data: bills
      })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      const store = null
      const billsView = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      const handleClickIconEye = jest.fn(billsView.handleClickIconEye)
      const eye = screen.getAllByTestId('icon-eye')[0]
      eye.addEventListener('click', handleClickIconEye(eye))
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
  })
})

//test d'intégration GET
describe('Given I am a user connected as Employee', () => {
  describe('When I navigate to Bills', () => {
    test('fetches bills from mock API GET', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a'
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText('Mes notes de frais'))
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy()
    })
    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills')
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock,
        })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'a@a',
          })
        )
        const root = document.createElement('div')
        root.setAttribute('id', 'root')
        document.body.appendChild(root)
        router()
      })
      test('fetches bills from an API and fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 404'))
            },
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test('fetches messages from an API and fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 500'))
            },
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})