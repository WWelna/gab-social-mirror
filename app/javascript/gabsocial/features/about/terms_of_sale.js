import React from 'react'
import Block from '../../components/block'
import Button from '../../components/button'
import Divider from '../../components/divider'
import Heading from '../../components/heading'
import Text from '../../components/text'

export default class TermsOfSale extends React.PureComponent {

  render() {

    return (
      <div className={[_s.d].join(' ')}>
        <Block>
          <div className={[_s.d, _s.px15, _s.py15].join(' ')}>
            <Heading>GAB AI INC</Heading>
            <br />
            <Heading>Terms of Sale</Heading>
            <Heading size='h4'>Last Updated: 03 February 2022</Heading>
            <br />

            <Text tagName='p' className={_s.mt15} size='medium'>Gab AI Inc (“We” or “Gab”) hereby allow you to access certain premium features or content in exchange for a one-time or recurring fee, as applicable to the relevant features or content, such as our “GabPro” enhanced social media offering, our Dissenter Shop, Gab Ads Credits, or the Gab Voice web teleconferencing service (each a “Paid Service” and collectively the "Paid Services"). Your transactions and any other use of the Paid Services are subject to these Gab Paid Service Terms of Sale ("Terms”).</Text>

            <br />
            <Heading size='h2'>1. Your Acceptance</Heading>

            <Text tagName='p' className={_s.mt15} size='medium'>
              By using a Paid Service, you signify your agreement to (1) these Terms of Sale; and (2) Gab AI Inc’s&nbsp;
              <Button
                isText
                underlineOnHover
                color='brand'
                backgroundColor='none'
                className={_s.displayInline}
                href='/about/tos'
              >
                Terms of Service
              </Button>
              ,&nbsp;
              <Button
                isText
                underlineOnHover
                color='brand'
                backgroundColor='none'
                className={_s.displayInline}
                href='/about/privacy'
              >
                Privacy Notice
              </Button>
              , and&nbsp;
              <Button
                isText
                underlineOnHover
                color='brand'
                backgroundColor='none'
                className={_s.displayInline}
                href='/about/dmca'
              >
                Copyright Notice
              </Button>
              &nbsp;and all other terms and conditions that generally apply to the Website (as such term is defined in the Terms of Service). Please read the Terms carefully. If you do not understand the Terms, or do not accept any part of them, then you may not use the Paid Services.
            </Text>

            <Text tagName='p' className={_s.mt15} size='medium'>Each time you place an order for a Paid Service (including when you order individual subscriptions or items of content), you enter into a separate contract for services on these Terms. When you complete a purchase, you signify that you wish to enter into a binding contract for the provision of the applicable Paid Services.</Text>

            <br />
            <Heading size='h2'>2. Payment, Refund and Cancellation Policy</Heading>
            <Text tagName='p' className={_s.mt15} size='medium'>Gab accepts payment via the current payment method indicated prior to purchase, which may include Bitcoin and/or any other form of payment that we make available to you from time to time. You must tender valid payment or have a valid accepted form of payment on file in order to purchase Paid Services. You agree to abide by any relevant Terms of Service or other legal agreement, whether with Gab or a third party, that governs your use of a given payment processing method. Prices for any Paid Service may change at any time, and Gab does not provide price protection or refunds in the event of a price reduction or promotional offering. You agree to pay for any Paid Service that you order. Gab will charge your credit card or other form of payment for the price listed on the relevant Paid Service offer, along with any additional amounts relating to applicable taxes, bank fees and currency fluctuations. If you purchase any automatically renewing subscriptions, you agree that Gab will charge the payment method on file on the first day of each billing period for the relevant subscription, and if the payment method on file becomes invalid due to an expired credit card or other similar reason and we are unable to charge you on the next billing period, Gab reserves the right to immediately revoke your access to any Paid Service you have ordered until you update your payment method. If you fail to update your payment method within a reasonable amount of time, Gab may cancel your subscription.</Text>
            <Text tagName='p' className={_s.mt15} size='medium'>Billing periods may be monthly or quarterly. The renewal period applicable to any subscription will be the same as the initial billing period for the Paid Services.</Text>
            <Text tagName='p' className={_s.mt15} size='medium'>If Gab is required to collect or pay any taxes in connection with your purchase of a Paid Service, such taxes will be charged to you at the time of each purchase transaction. Additionally, if required by law, you are responsible for reporting and paying certain taxes in connection with your purchase and use of a Paid Service. Such taxes may include duties, customs fees, or other taxes (other than income tax), along with any related penalties or interest, as applicable to your purchase or country of purchase.</Text>
            <Text tagName='p' className={_s.mt15} size='medium'>REFUNDS: all purchases of GabPRO and Gab Ads credits are final. For Gab Shop merchandise: Any claims for misprinted/damaged/defective items must be submitted within 4 weeks after the product has been received. For packages lost in transit, all claims must be submitted no later than 4 weeks after the estimated delivery date. Claims deemed an error on our part are covered at our expense. Please contact support@gab.com if you have a problem with your Gab Shop Order and would like a reprint or a refund. </Text>
            <Text tagName='p' className={_s.mt15} size='medium'>SUBSCRIPTION CANCELLATIONS: you purchase a subscription to a Paid Service that automatically renews, you may cancel the subscription any time before the end of the current billing period and the cancellation will take effect on the next billing period. You will retain access to the Paid Service from the time you cancel until the start of the next billing period, and will not receive a refund or credit for any remaining days in your current billing period. If you have any questions or need to contact us about cancellation, please send an e-mail to support [at] gab [dot] com or write to Gab, marked for the attention of "Support Services," at our business address listed at the bottom of this policy.</Text>

            <br />
            <Heading size='h2'>3. Accessing Paid Services.</Heading>
            <Text tagName='p' className={_s.mt15} size='medium'>Certain types of Paid Services may require you to use a device that meets the system and compatibility requirements for such Paid Service, which may change from time to time. You shall have sole responsibility for obtaining a device which satisfies those requirements.</Text>

            <br />
            <Heading size='h2'>4. License</Heading>
            <Text tagName='p' className={_s.mt15} size='medium'>Your use of the Paid Services must be only for personal, non-commercial use. You agree not to use any Paid Service, in whole or in part in connection with any public presentation even if no fee is charged (except where such use would not constitute a copyright infringement). You are receiving a non-exclusive license to access the Paid Service and all rights, title and interest in the Paid Services (including any content offered through the Paid Services) not expressly granted to you in these Terms are reserved by Gab and its licensors. If Gab reasonably determines that you violated any of the terms and conditions of the Paid Service Terms, your rights under this Section 4 will immediately terminate and Gab may terminate your access to the Paid Service and/or your Gab account without notice and without refund to you.</Text>

            <br />
            <Heading size='h2'>5. Restrictions</Heading>
            <Text tagName='p' className={_s.mt15} size='medium'>When you use the Paid Service, you may not (or attempt to):</Text>

            <ul className={[_s.d, _s.px15, _s.mt15, _s.ml15].join(' ')}>
              <li className={_s.mt10}>
                <Text tagName='p' size='medium'>violate the Terms of Service;</Text>
              </li>
              <li className={_s.mt10}>
                <Text tagName='p' size='medium'>use the Paid Service in an illegal manner or for an illegal purpose;</Text>
              </li>
              <li className={_s.mt10}>
                <Text tagName='p' size='medium'>share your account password with someone else to allow them to access any Paid Service that such person did not order;</Text>
              </li>
              <li className={_s.mt10}>
                <Text tagName='p' size='medium'>copy, sell, rent, or sublicense the Paid Services to any third party;</Text>
              </li>
              <li className={_s.mt10}>
                <Text tagName='p' size='medium'>circumvent, reverse-engineer, modify, disable, or otherwise tamper with any security technology that Gab uses to protect the Paid Service or encourage or help anyone else to do so;</Text>
              </li>
              <li className={_s.mt10}>
                <Text tagName='p' size='medium'>access the Paid Service other than by means authorized by Gab; or</Text>
              </li>
              <li className={_s.mt10}>
                <Text tagName='p' size='medium'>remove any proprietary notices or labels on Paid Services.</Text>
              </li>
            </ul>

            <br />
            <Heading size='h2'>6. Changes</Heading>
            <Text tagName='p' className={_s.mt15} size='medium'>Gab reserves the right to change the availability and content of the Paid Services at any time with or without notice to you. In addition, we reserve the right to modify, suspend, or discontinue any Paid Service with or without notice to you and we will not be liable to you or any third party for any such modifications, suspension, or termination. However, this will not affect your ability to request a refund as described above.</Text>
            <Text tagName='p' className={_s.mt15} size='medium'>
              In certain cases, content available within a Paid Service may become unavailable. Gab will have no liability to you for any such unavailability. We may also change these Paid Service Terms from time to time so we encourage you to periodically review the most up-to-date version at&nbsp;
              <Button
                isText
                underlineOnHover
                color='brand'
                backgroundColor='none'
                className={_s.displayInline}
                href='/about/sales'
              >
                https://gab.com/about/sales
              </Button>
              .
            </Text>
            <Text tagName='p' className={_s.mt15} size='medium'>If the Paid Service Terms change, you will have the opportunity to review the new terms when you next purchase any Paid Service. By completing the purchase, you signify your agreement to the new Paid Service Terms, and further, that they will apply to your use of the Service as a whole (including any Paid Service you have purchased in the past) and all subsequent purchases (until the Paid Service Terms change again). If you refuse to accept the updated Paid Service Terms then you may not buy any additional Paid Services and the latest version of the Paid Service Terms that you accepted will continue to apply to your use of previously purchased Paid Services.</Text>

            <br />
            <Heading size='h2'>7. Communications</Heading>
            <Text tagName='p' className={_s.mt15} size='medium'>By using the Paid Services, you consent to receiving communications from us including marketing communications such as newsletters about Gab features and content, special offers, promotional announcements, and customer surveys, to your registered email address or via other methods.</Text>

            <br />
            <Heading size='h2'>8. Other Terms</Heading>
            <Text tagName='p' className={_s.mt15} size='medium'>You acknowledge and agree that certain content available in the Paid Services may be considered offensive to some people and that such content may not be labeled as such. Additionally, certain descriptions of Paid Services or content available in the Paid Services are not guaranteed to be accurate. You agree to use the Paid Services at your own risk and, subject to applicable laws, Gab will have no liability to you for any content that you find offensive.</Text>
            <Text tagName='p' className={_s.mt15} size='medium'>The Paid Services are being provided by Gab AI Inc, reachable at:</Text>
            <Text tagName='p' className={[_s.mt15, _s.mb15].join(' ')} size='medium'>
              Gab AI Inc.<br />
              700 N State Street<br />
              Clarks Summit, PA 18411<br />
              United States of America
            </Text>

          </div>
        </Block>
      </div>
    )
  }

}
