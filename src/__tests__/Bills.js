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
import { bills } from '../fixtures/bills'
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


      const billsView = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })

      //Setup mocking wrapper to collect data about modal calling
      $.fn.modal = jest.fn()
      const handleClickNewBill = jest.fn(billsView.handleClickNewBill)
      const newBillButton = screen.getByTestId('btn-new-bill')

      newBillButton.addEventListener('click', handleClickNewBill())
      userEvent.click(newBillButton)

      expect(handleClickNewBill).toHaveBeenCalled()
      // We could also have checked for the correct change of pathname in URL
      // But that wouldn't assure us the UI has correctly changed
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

describe('Given I Log In as an employee', () => {
  describe('Upon redirect to Bills route', () => {
    test('Fetch data from API', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          // Login as mock API user
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
    describe('API returning error code', () => {
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
      test('API return 404 error code', async () => {
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

      test('API return 500 error code', async () => {
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