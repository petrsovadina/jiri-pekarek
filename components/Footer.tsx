import { intl } from "@/lib/i18n"

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-4">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-300">
        <p>
          &copy; {new Date().getFullYear()} TableGenAI. {intl.formatMessage({ id: "app.allRightsReserved" })}
        </p>
        <p className="mt-2">
          <a href="/terms" className="hover:underline text-gray-600 dark:text-gray-300 mr-4">
            {intl.formatMessage({ id: "app.termsOfService" })}
          </a>
          <a href="/privacy" className="hover:underline text-gray-600 dark:text-gray-300">
            {intl.formatMessage({ id: "app.privacyPolicy" })}
          </a>
        </p>
      </div>
    </footer>
  )
}

